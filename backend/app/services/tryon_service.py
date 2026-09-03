import asyncio
import time
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.tryon_job import TryOnJob
from ..models.look import GeneratedLook
from ..models.benchmark import BenchmarkLog
from ..providers import get_provider
from ..services.storage import storage_service


class TryOnService:
    @staticmethod
    async def process_tryon_job(job_id: str):
        """
        Background worker that processes a virtual try-on job.
        Runs through pipeline stages with step updates.
        """
        db: Session = SessionLocal()
        try:
            job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
            if not job:
                return

            start_time = time.time()
            job.status = "processing"
            job.progress = 15
            job.current_step = "Analyzing person portrait & human parsing..."
            db.commit()

            # Resolve image paths
            person_path = storage_service.resolve_url_to_path(job.person_image_url) or job.person_image_url
            garment_path = storage_service.resolve_url_to_path(job.garment_image_url) or job.garment_image_url
            
            await asyncio.sleep(0.6)
            job.progress = 35
            job.current_step = "Extracting garment geometry & cloth-agnostic mask..."
            db.commit()

            await asyncio.sleep(0.7)
            job.progress = 65
            job.current_step = f"Executing latent diffusion try-on via {job.provider.upper()}..."
            db.commit()

            # Execute provider inference
            provider = get_provider(job.provider)
            job.model_name = getattr(provider, "model_name", "VTON Engine")
            
            success, result_url, error = await provider.generate_tryon(
                person_image_path=person_path,
                garment_image_path=garment_path,
                category=job.garment_category,
                options=job.options,
                job_id=job.id
            )

            latency_ms = (time.time() - start_time) * 1000.0

            if success and result_url:
                job.progress = 90
                job.current_step = "Refining edges and harmonizing color balance..."
                db.commit()
                await asyncio.sleep(0.4)

                job.status = "completed"
                job.progress = 100
                job.current_step = "Try-on completed successfully."
                job.result_image_url = result_url
                job.latency_ms = latency_ms
                job.completed_at = datetime.utcnow()
                db.commit()

                # Log benchmark
                b_log = BenchmarkLog(
                    provider=job.provider,
                    model_name=job.model_name or job.provider,
                    latency_ms=latency_ms,
                    success=True
                )
                db.add(b_log)
                db.commit()
            else:
                job.status = "failed"
                job.progress = 100
                job.current_step = "Try-on generation failed."
                job.error_message = error or "Unknown provider inference failure."
                job.latency_ms = latency_ms
                job.completed_at = datetime.utcnow()
                db.commit()

                # Log failed benchmark
                b_log = BenchmarkLog(
                    provider=job.provider,
                    model_name=job.model_name or job.provider,
                    latency_ms=latency_ms,
                    success=False,
                    error_message=error
                )
                db.add(b_log)
                db.commit()

        except Exception as e:
            db.rollback()
            job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
            if job:
                job.status = "failed"
                job.progress = 100
                job.current_step = "Internal execution error"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
        finally:
            db.close()


tryon_service = TryOnService()

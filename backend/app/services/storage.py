import os
import shutil
import uuid
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile
from PIL import Image
from ..config import UPLOADS_DIR, RESULTS_DIR, SAMPLES_DIR, settings


class StorageService:
    @staticmethod
    async def save_upload_file(file: UploadFile, folder: Path = UPLOADS_DIR) -> Tuple[str, str]:
        """
        Saves an uploaded file locally and returns (relative_url, absolute_path).
        """
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
        if ext not in settings.ALLOWED_EXTENSIONS:
            ext = "jpg"
            
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        target_path = folder / unique_name
        
        contents = await file.read()
        with open(target_path, "wb") as f:
            f.write(contents)
            
        # Determine relative URL
        folder_name = folder.name  # 'uploads', 'results', etc.
        relative_url = f"/data/{folder_name}/{unique_name}"
        return relative_url, str(target_path)

    @staticmethod
    def resolve_url_to_path(url: str) -> Optional[str]:
        """
        Converts a relative URL like /data/uploads/xyz.jpg to local filesystem absolute path.
        """
        if not url:
            return None
        if url.startswith("http://") or url.startswith("https://"):
            return url  # External URL
            
        clean_url = url.lstrip("/")
        if clean_url.startswith("data/uploads/"):
            filename = clean_url.replace("data/uploads/", "")
            path = UPLOADS_DIR / filename
            return str(path) if path.exists() else None
        elif clean_url.startswith("data/results/"):
            filename = clean_url.replace("data/results/", "")
            path = RESULTS_DIR / filename
            return str(path) if path.exists() else None
        elif clean_url.startswith("data/samples/"):
            filename = clean_url.replace("data/samples/", "")
            path = SAMPLES_DIR / filename
            return str(path) if path.exists() else None
        return None

    @staticmethod
    def wipe_user_files(file_urls: list[str]) -> int:
        """
        Deletes physical files from storage for privacy compliance.
        """
        deleted_count = 0
        for url in file_urls:
            path = StorageService.resolve_url_to_path(url)
            if path and os.path.exists(path) and not path.startswith(str(SAMPLES_DIR)):
                try:
                    os.remove(path)
                    deleted_count += 1
                except Exception:
                    pass
        return deleted_count


storage_service = StorageService()

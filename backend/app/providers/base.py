from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple


class BaseVTONProvider(ABC):
    def __init__(self, name: str, is_commercial_safe: bool = False):
        self.name = name
        self.is_commercial_safe = is_commercial_safe

    @abstractmethod
    async def generate_tryon(
        self,
        person_image_path: str,
        garment_image_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None,
        job_id: Optional[str] = None
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Executes virtual try-on inference.
        Returns: (success: bool, result_image_path_or_url: str, error_message: Optional[str])
        """
        pass

    @abstractmethod
    async def get_status(self, job_id: str) -> Dict[str, Any]:
        """
        Queries status of an async inference job.
        Returns dictionary with status, progress, result_url, error.
        """
        pass

    @abstractmethod
    def is_available(self) -> Tuple[bool, str]:
        """
        Verifies if provider has necessary credentials/hardware to run.
        Returns (is_ready: bool, message: str)
        """
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Returns model metadata, supported categories, resolution, license.
        """
        pass

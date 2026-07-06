class ConversionError(Exception):
    """User-facing conversion failure with a readable message."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status

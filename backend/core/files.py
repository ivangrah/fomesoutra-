"""Validation et nommage des fichiers déposés (cours, devoirs, examens, rendus).

Limites connues : le type est détecté par signature (`filetype`) quand c'est possible,
sinon déduit de l'extension. Il n'y a pas d'analyse antivirus.
"""
import mimetypes
import uuid
from pathlib import Path

import filetype
from django.conf import settings
from django.core.exceptions import ValidationError

# Les fichiers ne sont jamais affichés dans le navigateur : toujours servis en téléchargement.
ALLOWED_EXTENSIONS = {
    "pdf", "doc", "docx", "odt", "txt", "rtf", "ppt", "pptx", "odp", "key",
    "xls", "xlsx", "csv", "ods", "mp4", "mov", "avi", "mkv", "webm",
    "png", "jpg", "jpeg", "gif", "webp", "svg", "zip", "rar", "7z", "tar", "gz",
    "sql", "js", "py", "java", "c", "cpp", "html", "css",
}
BLOCKED_MIME = {
    "application/x-msdownload",
    "application/x-executable",
    "application/x-elf",
    "application/x-mach-binary",
    "application/vnd.microsoft.portable-executable",
}


def unique_path(prefix, filename):
    """Clé de stockage imprévisible : le nom d'origine n'est jamais utilisé."""
    extension = Path(filename).suffix.lower()[:10]
    return f"{prefix}/{uuid.uuid4().hex}{extension}"


def detect_mime(upload):
    head = upload.read(261)
    upload.seek(0)
    guessed = filetype.guess(head)
    if guessed:
        return guessed.mime
    return mimetypes.guess_type(upload.name)[0] or "application/octet-stream"


def validate_upload(upload, kind):
    """Valide taille, extension et type ; retourne le type MIME détecté."""
    limits = settings.UPLOAD_MAX_MB
    if kind not in limits:
        raise ValueError(f"Type de fichier inconnu : {kind}")
    max_mb = limits[kind]
    if upload.size > max_mb * 1024 * 1024:
        raise ValidationError(f"Fichier trop volumineux (max {max_mb} Mo).", code="file_too_large")
    extension = Path(upload.name).suffix.lower().lstrip(".")
    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationError("Ce type de fichier n'est pas accepté.", code="file_type_not_allowed")
    mime = detect_mime(upload)
    if mime in BLOCKED_MIME:
        raise ValidationError("Ce type de fichier n'est pas accepté.", code="file_type_not_allowed")
    return mime

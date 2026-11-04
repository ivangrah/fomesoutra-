import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from core.files import unique_path, validate_upload

PDF = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n"


def test_pdf_valide_retourne_son_type():
    assert validate_upload(SimpleUploadedFile("cours.pdf", PDF), "cours") == "application/pdf"


def test_extension_refusee():
    with pytest.raises(ValidationError) as exc:
        validate_upload(SimpleUploadedFile("virus.exe", b"MZ\x90\x00"), "cours")
    assert exc.value.code == "file_type_not_allowed"


def test_executable_deguise_en_pdf_refuse():
    with pytest.raises(ValidationError) as exc:
        validate_upload(SimpleUploadedFile("cours.pdf", b"MZ\x90\x00" + b"\x00" * 300), "cours")
    assert exc.value.code == "file_type_not_allowed"


def test_taille_maximale_par_type(settings):
    settings.UPLOAD_MAX_MB = {"cours": 1, "devoir": 1, "examen": 1, "rendu": 1}
    gros = SimpleUploadedFile("cours.pdf", PDF + b"0" * (2 * 1024 * 1024))
    with pytest.raises(ValidationError) as exc:
        validate_upload(gros, "cours")
    assert exc.value.code == "file_too_large"


def test_cle_de_stockage_imprevisible():
    chemin = unique_path("resources/1", "Mon Cours Secret.PDF")
    assert chemin.startswith("resources/1/") and chemin.endswith(".pdf")
    assert "Secret" not in chemin

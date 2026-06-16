import sys
from pathlib import Path


# Propósito:
# - permitir que pytest importe el paquete local `app`
# - evitar depender de PYTHONPATH manual en cada entorno
API_ROOT = Path(__file__).resolve().parents[1]

if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

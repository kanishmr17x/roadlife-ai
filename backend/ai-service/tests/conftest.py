from pathlib import Path
import sys
import warnings

# Ensure ml-service directory is in sys.path for all pytest executions
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
if str(ML_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(ML_SERVICE_DIR))

# Suppress external third-party deprecation warnings (e.g., thop/ultralytics distutils warning)
warnings.filterwarnings("ignore", category=DeprecationWarning, module="thop.*")

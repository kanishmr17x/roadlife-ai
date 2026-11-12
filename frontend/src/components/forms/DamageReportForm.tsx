import React, { useState, useRef } from 'react';
import { CreateDamageInput, DamageRecord, DamageRepairEstimate } from '../../types/damage';
import { DamageSeverity } from '../../constants/status';
import { damageService } from '../../services/damage/damageService';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { DamageMarkerMap } from '../map/DamageMarkerMap';
import { 
  CheckCircle2, 
  Crosshair, 
  MapPin, 
  AlertCircle, 
  Image as ImageIcon, 
  Sparkles, 
  UploadCloud, 
  X, 
  Cpu, 
  Wrench,
  Layers,
  Clock,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';

export interface DamageReportFormProps {
  onSuccess?: (created: DamageRecord, isLiveBackend: boolean, message: string) => void;
  onCancel?: () => void;
}

export const DamageReportForm: React.FC<DamageReportFormProps> = ({ onSuccess, onCancel }) => {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [damageType, setDamageType] = useState('POTHOLE');
  const [severity, setSeverity] = useState<DamageSeverity>(DamageSeverity.MEDIUM);
  const [latitude, setLatitude] = useState<string>('12.9716');
  const [longitude, setLongitude] = useState<string>('77.5946');
  const [address, setAddress] = useState('');
  const [roadName, setRoadName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Image Upload & AI Vision State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [showUrlFallback, setShowUrlFallback] = useState<boolean>(false);
  const [aiDetectionResult, setAiDetectionResult] = useState<{
    status: string;
    detections: Array<{
      class_name: string;
      confidence: number;
      severity: string;
      bbox: { x_min: number; y_min: number; x_max: number; y_max: number };
    }>;
    smart_repair_plan?: {
      pci_score: number;
      urgency: string;
      estimated_cost_inr: number;
      material_spec: string;
      labor_hours: number;
      method: string;
    };
    aiServiceAvailable?: boolean;
    message?: string;
  } | null>(null);

  // UI Navigation / Map state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    isLive: boolean;
    message: string;
  } | null>(null);

  // Field validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum)) {
      errs.latitude = 'Latitude must be a valid number';
    } else if (latNum < -90 || latNum > 90) {
      errs.latitude = 'Latitude must be between -90 and 90';
    }

    if (isNaN(lonNum)) {
      errs.longitude = 'Longitude must be a valid number';
    } else if (lonNum < -180 || lonNum > 180) {
      errs.longitude = 'Longitude must be between -180 and 180';
    }

    if (photoUrl.trim() && !/^https?:\/\/.+/.test(photoUrl.trim())) {
      errs.photoUrl = 'Photo URL must start with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Browser Geolocation trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        geolocation: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setIsLocating(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.geolocation;
      return copy;
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      (err) => {
        setIsLocating(false);
        setErrors((prev) => ({
          ...prev,
          geolocation: `Location detection failed: ${err.message}`,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map pin coordinate picker
  const handlePickCoordinate = (lat: number, lon: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lon.toFixed(6));
  };

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Selected file must be an image (PNG, JPG, WEBP).' }));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'File size exceeds maximum 8MB limit.' }));
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setAiDetectionResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAiDetectionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run AI Damage Detection
  const handleRunAIDetection = async () => {
    const imagePayload = imagePreview || photoUrl;
    if (!imagePayload) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload an image or provide a valid photo URL first.' }));
      return;
    }

    setIsAnalyzingAI(true);
    try {
      const result = await damageService.detectDamageAI(imagePayload);
      setAiDetectionResult(result);

      if (result.detections && result.detections.length > 0) {
        const topDetection = result.detections[0];
        const cls = topDetection.class_name.toUpperCase();

        if (cls.includes('POTHOLE')) {
          setDamageType('POTHOLE');
        } else if (cls.includes('ALLIGATOR') || cls.includes('FATIGUE')) {
          setDamageType('ALLIGATOR_CRACK');
        } else if (cls.includes('CRACK')) {
          setDamageType('TRANSVERSE_CRACK');
        } else if (cls.includes('RUT')) {
          setDamageType('RUTTING');
        } else if (cls.includes('EDGE')) {
          setDamageType('EDGE_FAILURE');
        }

        const sev = topDetection.severity?.toUpperCase();
        if (sev === 'CRITICAL') setSeverity(DamageSeverity.CRITICAL);
        else if (sev === 'HIGH') setSeverity(DamageSeverity.HIGH);
        else if (sev === 'MEDIUM') setSeverity(DamageSeverity.MEDIUM);
        else if (sev === 'LOW') setSeverity(DamageSeverity.LOW);

        if (!title.trim()) {
          const formattedCls = topDetection.class_name.replace(/_/g, ' ');
          setTitle(`AI Detected: ${formattedCls} (${Math.round(topDetection.confidence * 100)}% conf)`);
        }

        if (!description.trim() && result.smart_repair_plan) {
          const plan = result.smart_repair_plan;
          setDescription(
            `AI Vision Scan: ${topDetection.class_name.replace(/_/g, ' ')} detected (${Math.round(
              topDetection.confidence * 100
            )}% confidence). Recommended treatment: ${plan.method} (${plan.material_spec}). Assessed PCI: ${
              plan.pci_score
            }/100. Priority: ${plan.urgency}.`
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI Vision inference failed';
      setErrors((prev) => ({ ...prev, photo: msg }));
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    let repairEstimate: DamageRepairEstimate | undefined = undefined;
    if (aiDetectionResult?.smart_repair_plan) {
      const plan = aiDetectionResult.smart_repair_plan;
      repairEstimate = {
        estimatedCostInr: plan.estimated_cost_inr,
        materialType: plan.material_spec,
        materialQuantityKg: 350,
        estimatedLaborCount: 4,
        estimatedHours: plan.labor_hours,
        isAiGenerated: true,
      };
    }

    const input: CreateDamageInput = {
      title,
      description,
      damageType,
      severity,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address.trim() || undefined,
      roadName: roadName.trim() || undefined,
      photoUrl: imagePreview || (photoUrl.trim() || undefined),
      repairEstimate,
    };

    try {
      const result = await damageService.createDamage(input);
      setSubmitResult({
        success: true,
        isLive: result.isLiveBackend,
        message: result.message || 'Report logged successfully in municipal registry.',
      });

      if (onSuccess) {
        onSuccess(result.data, result.isLiveBackend, result.message || '');
      }

      // Reset form fields
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setAddress('');
        setRoadName('');
        setPhotoUrl('');
        handleClearImage();
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report';
      setSubmitResult({
        success: false,
        isLive: false,
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedLat = parseFloat(latitude);
  const parsedLon = parseFloat(longitude);
  const validCoordinates = !isNaN(parsedLat) && !isNaN(parsedLon);

  return (
    <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-lg p-5 sm:p-7 shadow-sm max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D8D7CE] pb-4">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#78846A] uppercase tracking-wider">
          <span>SCHEDULE IRC-84</span>
          <span>•</span>
          <span>CIVIC INSPECTION REGISTER</span>
          <span>•</span>
          <span className="text-[#355844] font-semibold">AI ASSISTED</span>
        </div>
        <h2 className="text-xl font-bold text-[#252A24] font-serif mt-1">
          Record Road Surface Distress & Pavement Cavity
        </h2>
        <p className="text-xs text-[#6F726A] mt-0.5">
          Upload an inspection photo for instant YOLOv8 distress detection or input field notes for municipal triage and contractor dispatch.
        </p>
      </div>

      {submitResult && (
        <div
          className={`p-4 rounded-md border flex items-start gap-3 transition-all ${
            submitResult.success
              ? 'bg-[#EDF3EE] border-[#C6D8CC] text-[#264031]'
              : 'bg-[#FAF0EF] border-[#E5C2BF] text-[#A9423B]'
          }`}
        >
          {submitResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-[#355844] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#A9423B] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-sm">
              {submitResult.success ? 'Inspection Entry Logged Successfully' : 'Submission Alert'}
            </p>
            <p className="text-xs text-[#5A5D55]">{submitResult.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 01: Visual Evidence & AI Auto-Detection */}
        <div className="space-y-3.5 bg-[#FAF9F5] p-4 sm:p-5 rounded-md border border-[#E3E2DA]">
          <div className="flex items-center justify-between border-b border-[#D8D7CE] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A]">
                01 / PHOTOGRAPHIC EVIDENCE & AI VISION
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDF3EE] text-[#355844] border border-[#C6D8CC]">
                <Cpu className="w-3 h-3" />
                YOLOv8 + OpenCV
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUrlFallback(!showUrlFallback)}
              className="text-[11px] font-mono text-[#355844] hover:underline"
            >
              {showUrlFallback ? 'Upload File' : 'Use Photo URL'}
            </button>
          </div>

          {!showUrlFallback ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="damage-photo-upload"
              />

              {!imagePreview ? (
                <label
                  htmlFor="damage-photo-upload"
                  className="border-2 border-dashed border-[#C6D8CC] hover:border-[#355844] bg-[#FFFEFA] rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <div className="p-3 rounded-full bg-[#EDF3EE] text-[#355844] group-hover:scale-105 transition-transform mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#252A24]">
                    Click to browse or drop road photograph here
                  </p>
                  <p className="text-xs text-[#6F726A] mt-1">
                    Supports JPG, PNG, WEBP (camera photos accepted, max 8MB)
                  </p>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FFFEFA] p-3 rounded-md border border-[#D8D7CE]">
                    <img
                      src={imagePreview}
                      alt="Defect Preview"
                      className="w-32 h-24 object-cover rounded border border-[#D8D7CE] shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-[#252A24] truncate">
                        {selectedFile?.name || 'Uploaded road photo'}
                      </p>
                      <p className="text-[11px] text-[#6F726A] font-mono">
                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Image ready for scan'}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleRunAIDetection}
                          isLoading={isAnalyzingAI}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#F5C443]" />}
                        >
                          Auto-Detect Distress (AI)
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearImage}
                          leftIcon={<X className="w-3.5 h-3.5" />}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                label="Inspection Photo URL"
                placeholder="https://example.com/pavement-photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                error={errors.photoUrl}
                leftIcon={<ImageIcon className="w-4 h-4" />}
                helperText="Link high-resolution pavement photograph for AI aggregate analysis."
              />
              {photoUrl && !errors.photoUrl && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleRunAIDetection}
                    isLoading={isAnalyzingAI}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#C48B32]" />}
                  >
                    Scan Photo URL with AI
                  </Button>
                </div>
              )}
            </div>
          )}

          {errors.photo && (
            <p className="text-xs text-[#A9423B] font-medium">⚠ {errors.photo}</p>
          )}

          {/* AI Detection Results Card */}
          {aiDetectionResult && (
            <div className="mt-3 p-4 rounded-md bg-[#EDF3EE] border border-[#C6D8CC] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#264031] font-mono uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#355844]" />
                  AI Vision Inspection Complete
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#355844] text-[#FFFEFA]">
                  {aiDetectionResult.aiServiceAvailable ? 'PyTorch YOLOv8' : 'OpenCV Edge & Cavity Fallback'}
                </span>
              </div>

              {aiDetectionResult.detections && aiDetectionResult.detections.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {aiDetectionResult.detections.map((det, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-[#FFFEFA] border border-[#C6D8CC] text-[#252A24]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#355844]" />
                        {det.class_name.replace(/_/g, ' ')}
                        <span className="text-[#355844] font-mono">
                          {Math.round(det.confidence * 100)}%
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1 rounded bg-[#F5F3EC] text-[#6F726A]">
                          {det.severity}
                        </span>
                      </span>
                    ))}
                  </div>

                  {aiDetectionResult.smart_repair_plan && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#C6D8CC] text-xs">
                      <div className="p-2 rounded bg-[#FFFEFA] border border-[#D8D7CE]">
                        <span className="text-[10px] font-mono text-[#6F726A] block">PCI SCORE</span>
                        <span className="font-bold text-[#252A24]">
                          {aiDetectionResult.smart_repair_plan.pci_score} / 100
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#FFFEFA] border border-[#D8D7CE]">
                        <span className="text-[10px] font-mono text-[#6F726A] block">URGENCY</span>
                        <span className="font-bold text-[#A9423B]">
                          {aiDetectionResult.smart_repair_plan.urgency}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#FFFEFA] border border-[#D8D7CE]">
                        <span className="text-[10px] font-mono text-[#6F726A] block">EST. BUDGET</span>
                        <span className="font-bold text-[#355844] font-mono">
                          ₹{aiDetectionResult.smart_repair_plan.estimated_cost_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#FFFEFA] border border-[#D8D7CE]">
                        <span className="text-[10px] font-mono text-[#6F726A] block">CREW HOURS</span>
                        <span className="font-bold text-[#252A24]">
                          {aiDetectionResult.smart_repair_plan.labor_hours} hrs
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-[#355844]">
                    ✓ Classification, severity, and repair estimates have been populated below.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#6F726A]">
                  No severe distress detected above confidence threshold. Normal pavement surface condition.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 02: Classification */}
        <div className="space-y-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78846A] border-b border-[#D8D7CE]/70 pb-1">
            02 / Distress Classification & Severity
          </div>

          <Input
            label="Defect Title / Summary"
            required
            placeholder="e.g. Deep pothole cavity on outer lane before flyover approach"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252A24] mb-1">
                Distress Category <span className="text-[#A9423B]">*</span>
              </label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                className="w-full rounded bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] text-xs sm:text-sm py-2 px-3 focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/25"
              >
                <option value="POTHOLE">Pothole / Localized Cavity</option>
                <option value="ALLIGATOR_CRACK">Alligator Fatigue Cracking</option>
                <option value="TRANSVERSE_CRACK">Transverse Thermal Cracking</option>
                <option value="RUTTING">Wheelpath Rutting Depression</option>
                <option value="EDGE_FAILURE">Shoulder Edge Breaking</option>
                <option value="DRAINAGE_DEFECT">Drain Grate Collapse / Water Trap</option>
                <option value="EROSION">Surface Binder Ravelling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252A24] mb-1">
                Assessed Severity Rating <span className="text-[#A9423B]">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { val: DamageSeverity.LOW, label: 'Low', color: 'border-[#C6D8CC] text-[#355844] bg-[#EDF3EE]' },
                  { val: DamageSeverity.MEDIUM, label: 'Medium', color: 'border-[#F1DAB0] text-[#9A6A1E] bg-[#FDF7EC]' },
                  { val: DamageSeverity.HIGH, label: 'High', color: 'border-[#ECC4B8] text-[#B9684D] bg-[#FBF0EC]' },
                  { val: DamageSeverity.CRITICAL, label: 'Critical', color: 'border-[#E5C2BF] text-[#A9423B] bg-[#FAF0EF]' },
                ].map(({ val, label, color }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSeverity(val)}
                    className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                      severity === val
                        ? `font-bold ring-2 ring-[#355844] ${color}`
                        : 'bg-[#FFFEFA] border-[#D8D7CE] text-[#6F726A] hover:bg-[#F5F3EC]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 03: Field Observation Notes */}
        <div className="space-y-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78846A] border-b border-[#D8D7CE]/70 pb-1">
            03 / Field Observation Notes
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252A24] mb-1">
              Field Description & Dimensions <span className="text-[#A9423B]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record estimated cavity depth (cm), diameter, lane obstruction, and risk to two-wheelers..."
              className={`w-full rounded bg-[#FFFEFA] border text-[#252A24] text-xs sm:text-sm py-2 px-3 focus:outline-none focus:ring-1 ${
                errors.description
                  ? 'border-[#A9423B] focus:border-[#A9423B]'
                  : 'border-[#D8D7CE] focus:border-[#355844]'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[#A9423B] font-medium">⚠ {errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Road Corridor / Highway Ref"
              placeholder="e.g. Outer Ring Road, NH-44"
              value={roadName}
              onChange={(e) => setRoadName(e.target.value)}
            />
            <Input
              label="Nearest Landmark / Junction"
              placeholder="e.g. Near Ecospace Bus Bay, Bellandur"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Section 04: Geographic Coordinates */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#D8D7CE]/70 pb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A]">
              04 / Geographic Positioning (EPSG:4326)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="text-[11px] font-medium text-[#355844] hover:underline flex items-center gap-1 font-mono"
              >
                <Crosshair className="w-3 h-3" />
                <span>{isLocating ? 'Locating...' : 'Use GPS'}</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-[11px] font-medium text-[#355844] hover:underline font-mono"
              >
                {showMapPicker ? 'Close Map' : 'Select on Map'}
              </button>
            </div>
          </div>

          {errors.geolocation && (
            <p className="text-xs text-[#C48B32] font-mono">⚠ {errors.geolocation}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Latitude (-90° to 90° N)"
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              error={errors.latitude}
              placeholder="12.9716"
            />
            <Input
              label="Longitude (-180° to 180° E)"
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              error={errors.longitude}
              placeholder="77.5946"
            />
          </div>

          {showMapPicker && (
            <div className="space-y-1.5 p-2 rounded bg-[#F5F3EC] border border-[#D8D7CE]">
              <span className="text-[11px] font-mono text-[#6F726A] block">
                Click target location to pin coordinates:
              </span>
              <DamageMarkerMap
                damages={[]}
                height="240px"
                allowCoordinatePicking
                onPickCoordinate={handlePickCoordinate}
                pickedCoordinate={validCoordinates ? [parsedLat, parsedLon] : null}
              />
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D8D7CE]">
          <span className="text-[11px] font-mono text-[#6F726A]">
            Specification: IRC-SP-100 compliant field entry
          </span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Record Inspection Entry
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

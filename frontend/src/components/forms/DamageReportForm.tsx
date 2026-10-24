import React, { useState } from 'react';
import { CreateDamageInput, DamageRecord } from '../../types/damage';
import { DamageSeverity } from '../../constants/status';
import { damageService } from '../../services/damage/damageService';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { DamageMarkerMap } from '../map/DamageMarkerMap';
import { Card } from '../common/Card';
import { CheckCircle2, Crosshair, MapPin, AlertCircle, Image as ImageIcon, FileText } from 'lucide-react';

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

  // UI state
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

  // Browser Geolocation trigger (only on user click)
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    const input: CreateDamageInput = {
      title,
      description,
      damageType,
      severity,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address.trim() || undefined,
      roadName: roadName.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
    };

    try {
      const result = await damageService.createDamage(input);
      setSubmitResult({
        success: true,
        isLive: result.isLiveBackend,
        message: result.message || 'Report logged successfully in local session register',
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
    <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-5 sm:p-6 shadow-sm max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D8D7CE] pb-3.5">
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#78846A] uppercase tracking-wider">
          <span>SCHEDULE IRC-84</span>
          <span>•</span>
          <span>FORM REF: PWD-FIELD-LOG</span>
        </div>
        <h2 className="text-lg font-bold text-[#252A24] font-serif mt-1">
          Pavement Defect & Distress Inspection Entry
        </h2>
        <p className="text-xs text-[#6F726A] mt-0.5">
          Record verified road pavement anomalies, surface cavities, and structural cracking for municipal triage.
        </p>
      </div>

      {submitResult && (
        <div
          className={`p-3.5 rounded border flex items-start gap-3 ${
            submitResult.success
              ? 'bg-[#EDF3EE] border-[#C6D8CC] text-[#264031]'
              : 'bg-[#FAF0EF] border-[#E5C2BF] text-[#A9423B]'
          }`}
        >
          {submitResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-[#355844] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#A9423B] shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 text-xs">
            <p className="font-semibold">
              {submitResult.success ? 'Inspection Entry Logged' : 'Submission Alert'}
            </p>
            <p className="text-[11px] text-[#5A5D55]">{submitResult.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 01: Classification */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78846A] border-b border-[#D8D7CE]/70 pb-1">
            01 / Distress Classification
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

        {/* Section 02: Description & Corridor */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78846A] border-b border-[#D8D7CE]/70 pb-1">
            02 / Field Observation Notes
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

        {/* Section 03: Geographic Coordinates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#D8D7CE]/70 pb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A]">
              03 / Geographic Positioning (EPSG:4326)
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

        {/* Section 04: Visual Reference */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#78846A] border-b border-[#D8D7CE]/70 pb-1">
            04 / Photographic Reference
          </div>

          <Input
            label="Inspection Photo URL (Optional)"
            placeholder="https://example.com/pavement-photo.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            error={errors.photoUrl}
            leftIcon={<ImageIcon className="w-4 h-4" />}
            helperText="Link high-resolution pavement photograph for AI aggregate analysis and contractor work order verification."
          />

          {photoUrl && !errors.photoUrl && (
            <div className="p-2 rounded bg-[#F5F3EC] border border-[#D8D7CE] max-w-xs">
              <span className="text-[10px] font-mono text-[#6F726A] block mb-1">Specimen Preview:</span>
              <img
                src={photoUrl}
                alt="Field inspection preview"
                className="w-full h-28 object-cover rounded"
                onError={() =>
                  setErrors((prev) => ({
                    ...prev,
                    photoUrl: 'Image preview could not be loaded from this URL',
                  }))
                }
              />
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D8D7CE]">
          <span className="text-[11px] font-mono text-[#6F726A]">
            Validation: Ready for entry
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

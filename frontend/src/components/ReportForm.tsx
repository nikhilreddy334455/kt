import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Calendar,
  Mail,
  FileText,
  AlertCircle,
  Loader2,
  Wand2,
} from 'lucide-react';
import { TARGET_CATEGORIES, ItemFormData } from '../lib/types';

// Zod schema matching Section 16
const formSchema = z.object({
  report_type: z.enum(['lost', 'found']),
  category: z.string().min(1, 'Please select a category'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  image_url: z.string().url('Please provide a valid image URL or upload an image file'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(150, 'Location cannot exceed 150 characters'),
  event_time: z.string().min(1, 'Please select the date and time of the event'),
  contact_info: z.string().min(3, 'Please provide valid contact information'),
});

type FormValues = z.infer<typeof formSchema>;

interface ReportFormProps {
  initialReportType: 'lost' | 'found';
  onSubmit: (data: ItemFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  initialReportType,
  onSubmit,
  isSubmitting = false,
}) => {
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [previewError, setPreviewError] = useState(false);

  // Default event_time to current ISO string formatted for datetime-local input
  const defaultDateTime = new Date().toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_type: initialReportType,
      category: 'Electronics',
      title: '',
      description: '',
      image_url: '',
      location: '',
      event_time: defaultDateTime,
      contact_info: '',
    },
  });

  const watchedImageUrl = watch('image_url');
  const watchedReportType = watch('report_type');

  // Handle local file upload converting to base64 Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) {
        alert('File size exceeds 4.5MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue('image_url', base64String, { shouldValidate: true });
        setPreviewError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Demo presets for 1-click test fill
  const handleDemoPreset = (presetType: 'bottle' | 'earbuds' | 'keys') => {
    const isLost = watchedReportType === 'lost';
    const nowIso = new Date().toISOString().slice(0, 16);

    if (presetType === 'bottle') {
      setValue('category', 'Miscellaneous');
      setValue(
        'title',
        isLost ? 'Blue Hydro Flask 32oz' : 'Found Blue Hydroflask Water Bottle'
      );
      setValue(
        'description',
        isLost
          ? 'Cobalt blue 32oz wide mouth Hydro Flask with a silver cap. Has a small dent near the bottom rim and a national park sticker.'
          : 'Found a 32oz cobalt blue metal water bottle with silver lid and a round national park sticker near the fountain.'
      );
      setValue(
        'image_url',
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
      );
      setValue(
        'location',
        isLost ? 'Main Library 2nd Floor Study Room' : 'Library Quad Outdoor Benches'
      );
      setValue('event_time', nowIso);
      setValue('contact_info', 'student.sample@campus.edu');
    } else if (presetType === 'earbuds') {
      setValue('category', 'Electronics');
      setValue(
        'title',
        isLost ? 'AirPods Pro 2 in Black Case' : 'Found Apple AirPods in Black Case'
      );
      setValue(
        'description',
        isLost
          ? 'White AirPods Pro 2 inside a matte black silicone case with a small carabiner. Lost after afternoon lecture.'
          : 'AirPods in black protective silicone cover found tucked between seats in row 4 of the lecture hall.'
      );
      setValue(
        'image_url',
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'
      );
      setValue(
        'location',
        isLost ? 'Science Center Lecture Hall B10' : 'Science Center Lecture Hall B10 Podium'
      );
      setValue('event_time', nowIso);
      setValue('contact_info', 'tech.desk@campus.edu');
    } else {
      setValue('category', 'Keys');
      setValue(
        'title',
        isLost ? 'Subaru Car Key with Red Lanyard' : 'Set of Keys with Red University Lanyard'
      );
      setValue(
        'description',
        isLost
          ? 'Black electronic Subaru key fob attached to brass dorm key #314 on a red woven university alumni lanyard.'
          : 'Found car remote fob with a brass room key on a red alumni lanyard near parking stall 210.'
      );
      setValue(
        'image_url',
        'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80'
      );
      setValue(
        'location',
        isLost ? 'North Campus Parking Structure Level 2' : 'North Campus Parking Elevator Lobby'
      );
      setValue('event_time', nowIso);
      setValue('contact_info', 'campus.safety@campus.edu');
    }
    setPreviewError(false);
  };

  const onFormSubmit = async (values: FormValues) => {
    // Convert datetime-local to valid ISO UTC datetime
    const isoDateTime = new Date(values.event_time).toISOString();
    await onSubmit({
      ...values,
      event_time: isoDateTime,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Form Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Gemini 2.5 Flash Multimodal Pipeline</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Submit {watchedReportType === 'lost' ? 'Lost Item Report' : 'Found Item Report'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Provide photographic and contextual details. Our AI Matching Engine will instantly
              scan campus reports and compute match confidence scores.
            </p>
          </div>

          {/* Quick Demo Pre-fill Pill Buttons */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-brand-400" />
              1-Click Demo Presets:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoPreset('bottle')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                Hydroflask
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('earbuds')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                AirPods
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('keys')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                Car Keys
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 md:p-8 space-y-6">
        {/* Report Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Report Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <label
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 cursor-pointer font-bold text-sm transition-all ${
                watchedReportType === 'lost'
                  ? 'border-rose-500 bg-rose-50/50 text-rose-700 shadow-sm ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <input
                type="radio"
                value="lost"
                {...register('report_type')}
                className="sr-only"
              />
              <span>I Lost an Item</span>
            </label>

            <label
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 cursor-pointer font-bold text-sm transition-all ${
                watchedReportType === 'found'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <input
                type="radio"
                value="found"
                {...register('report_type')}
                className="sr-only"
              />
              <span>I Found an Item</span>
            </label>
          </div>
          {errors.report_type && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.report_type.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              {TARGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Blue 32oz Hydro Flask Water Bottle"
              {...register('title')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Detailed Description &amp; Defining Marks <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Include distinctive identifiers: scratches, stickers, brand model, color shade, dents, engravings..."
            {...register('description')}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description.message}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Detailed descriptions give Gemini 2.5 Flash higher accuracy scores.
              </p>
            )}
          </div>
        </div>

        {/* Multimodal Image Input (Required for multimodal AI analysis) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                Item Photo (Required for Multimodal AI Analysis) <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a photo or paste a direct image URL for computer vision inspection.
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`px-3 py-1 rounded-md transition-all ${
                  imageInputMode === 'url'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Web URL
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`px-3 py-1 rounded-md transition-all ${
                  imageInputMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-2">
              {imageInputMode === 'url' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    {...register('image_url')}
                    onChange={(e) => {
                      setValue('image_url', e.target.value, { shouldValidate: true });
                      setPreviewError(false);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl cursor-pointer bg-white transition-all group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-600 transition-colors mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    Click to browse photo from your device
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WebP up to 4.5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}

              {errors.image_url && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.image_url.message}
                </p>
              )}
            </div>

            {/* Live Image Preview Thumbnail */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
              {watchedImageUrl && !previewError ? (
                <img
                  src={watchedImageUrl}
                  alt="Item Preview"
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <ImageIcon className="w-8 h-8 stroke-1 mb-1" />
                  <span className="text-[11px]">Image Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Campus Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Science Center B10"
              {...register('location')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {errors.location && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Event Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Event Date &amp; Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('event_time')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {errors.event_time && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.event_time.message}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Contact Email / Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="student@campus.edu"
              {...register('contact_info')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {errors.contact_info && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.contact_info.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
              watchedReportType === 'lost'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini Multimodal Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit &amp; Run AI Matching Engine</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

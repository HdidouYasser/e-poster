import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';

/**
 * Composant FormField réutilisable pour les champs de formulaire
 */
export const FormField = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  register,
  errors,
  helperText = '',
  required = true,
  options = null,
  maxLength = null,
  rows = 3
}) => {
  const error = errors[name];
  const hasError = !!error;

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          placeholder={placeholder}
          rows={rows}
          {...register(name)}
          className={`form-textarea ${hasError ? 'border-red-500 focus:border-red-500 bg-red-50' : ''}`}
          maxLength={maxLength}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          {...register(name)}
          className={`form-select ${hasError ? 'border-red-500 focus:border-red-500 bg-red-50' : ''}`}
        >
          <option value="">-- Sélectionner --</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          className={`rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 ${
            hasError && 'border-red-500'
          }`}
        />
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          maxLength={maxLength}
          className={`form-input ${hasError ? 'border-red-500 focus:border-red-500 bg-red-50' : ''}`}
        />
      )}

      {helperText && !hasError && (
        <p className="form-hint">{helperText}</p>
      )}

      {hasError && (
        <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 rounded-lg">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Composant Form wrapper avec Zod validation
 */
export const Form = ({
  schema,
  onSubmit,
  children,
  defaultValues = {},
  submitLabel = 'Envoyer',
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const onFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {children({ register, errors, watch })}

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting || isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Traitement en cours...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
};

export default { FormField, Form };

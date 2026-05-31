import { z } from 'zod';

export const publicationSchema = z.object({
  title: z.string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z.string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères"),
  abstractText: z.string()
    .optional()
    .refine((val) => !val || val.length >= 10, "L'abstract doit contenir au moins 10 caractères si fourni"),
  authors: z.string()
    .min(3, "Les auteurs doivent être spécifiés"),
  authorsStr: z.string().optional(),
  eventId: z.string()
    .min(1, "Un événement doit être sélectionné"),
  status: z.string()
    .min(1, "Un statut doit être sélectionné"),
  session: z.string().optional(),
  room: z.string().optional(),
  category: z.string().optional(),
  categoryStr: z.string().optional(),
  posterUrl: z.string()
    .url("URL du poster invalide")
    .optional()
    .or(z.literal('')),
  published: z.boolean().optional(),
});

export const screenSchema = z.object({
  name: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  location: z.string()
    .min(3, "La localisation doit être spécifiée"),
  screenType: z.string()
    .min(1, "Le type d'écran doit être sélectionné"),
  eventId: z.string().optional(),
});

export const eventSchema = z.object({
  name: z.string()
    .min(5, "Le nom de l'événement doit contenir au moins 5 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  description: z.string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .optional(),
  startDate: z.string()
    .refine((date) => new Date(date) > new Date(), "La date de début doit être dans le futur"),
  endDate: z.string()
    .optional(),
  location: z.string()
    .min(3, "La localisation doit être spécifiée"),
  status: z.string()
    .min(1, "Un statut doit être sélectionné"),
});

export const categorySchema = z.object({
  name: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string()
    .optional(),
});

export const authorSchema = z.object({
  firstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string()
    .email("L'email doit être valide")
    .optional()
    .or(z.literal('')),
  affiliation: z.string()
    .optional(),
});

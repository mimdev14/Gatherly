import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["organizer", "volunteer"], { message: "Choose a role" }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    date: z.coerce.date({ message: "Enter a valid event date" }),
    location: z.string().trim().min(2, "Location is required"),
    category: z.string().trim().min(2, "Category is required"),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(10000),
    requiredSkills: z.array(z.string().trim().min(1)).min(1, "Add at least one required skill"),
    registrationDeadline: z.coerce.date({ message: "Enter a valid deadline" }),
  })
  .refine((d) => d.registrationDeadline <= d.date, {
    message: "Registration deadline must be on or before the event date",
    path: ["registrationDeadline"],
  });
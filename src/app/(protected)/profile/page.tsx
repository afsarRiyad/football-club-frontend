"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button, Input, Card, CardContent, CardHeader, Avatar } from "@/components/ui";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { data: response } = await api.patch(`/users/${user?._id}`, data);
      updateUser(response.data);
      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await api.post("/uploads/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const photoUrl = data.data.file.url;
      await api.patch(`/users/${user?._id}`, { photo: photoUrl });
      updateUser({ photo: photoUrl });
      showToast("Photo updated successfully!", "success");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Update your personal information</p>
      </div>

      {/* Photo Upload */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar src={user?.photo} alt={user?.name} size="lg" />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Profile Photo</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {uploading ? "Uploading..." : "Click the camera icon to upload"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email address"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

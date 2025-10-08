"use client";

import { CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { experiences, instruments } from "@/data";
import {
  Plus,
  Globe,
  User,
  Lock,
  Music,
  Briefcase,
  Mail,
  X,
  Piano,
  DollarSign,
  Calendar,
  ChevronUp,
  ChevronDown,
  Camera,
  MapPin,
  Phone,
  Building,
  Play,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SectionContainer } from "./SectionContainer";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import { ToggleSwitch } from "./ToggleSwitch";
import { ModalActions } from "./ModalActions";
import { Modal } from "./Modal";
import { VideoProfileProps } from "@/types/userTypes";
import VideoProfileComponent from "./VideoProfileComponent";

// Types
interface RateProps {
  regular: string;
  function: string;
  concert: string;
  corporate: string;
}

interface SocialHandle {
  platform: string;
  handle: string;
}

const CurrentUserProfile = () => {
  // Authentication and user data
  const { user: userdata } = useUser();
  const { user, isLoading: userLoading } = useCurrentUser();
  const { colors } = useThemeColors();

  // Convex mutations
  const updateUser = useMutation(api.controllers.user.updateUserProfile);

  // State management
  const [loading, setLoading] = useState(false);

  // Personal Information
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [rate, setRate] = useState<RateProps>({
    regular: "",
    function: "",
    concert: "",
    corporate: "",
  });

  // Location Information
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Talent Information
  const [instrument, setInstrument] = useState("Piano");
  const [experience, setExperience] = useState("noexp");
  const [talentbio, setTalentbio] = useState("");
  const [genre, setGenre] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [showGenreModal, setShowGenreModal] = useState(false);

  // Date of Birth
  const [age, setAge] = useState("1");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Social Media
  const [handles, setHandles] = useState<SocialHandle[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialHandle, setNewSocialHandle] = useState("");

  // Account Type
  const [isMusician, setIsMusician] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client Specific
  const [organization, setOrganization] = useState("");
  const [clienthandles, setClientHandles] = useState("");

  // UI State
  const [showRates, setShowRates] = useState(false);

  // Video Profile State
  const [videos, setVideos] = useState<VideoProfileProps[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  // Constants
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const updateRateField = (field: keyof RateProps, value: string) => {
    setRate((prev) => ({
      ...prev,
      [field]: value || "",
    }));
  };

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setCity(user.city || "");
      setExperience(user.experience || "");
      setInstrument(user.instrument || "");
      setYear(user.year || "");
      setMonth(user.month || "");
      setAge(user.date || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setOrganization(user.organization || "");
      setHandles(user.musicianhandles || []);
      setGenre(user.musiciangenres || []);
      setTalentbio(user.talentbio || "");
      setIsMusician(user.isMusician || false);
      setIsClient(user.isClient || false);
      setClientHandles(user.handles || "");
      setVideos(user.videosProfile || []);
      // Fix for rate object - handle partial objects and undefined values
      const userRate = user.rate || {};
      setRate({
        regular: userRate.regular || "",
        function: userRate.function || "",
        concert: userRate.concert || "",
        corporate: userRate.corporate || "",
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const updateData = {
        firstname,
        lastname,
        email,
        username,
        city,
        instrument,
        experience,
        date: age,
        month,
        year,
        address,
        phone,
        organization,
        musicianhandles: handles,
        musiciangenres: genre,
        talentbio,
        handles: clienthandles,
        isMusician,
        isClient,
        rate,
        videosProfile: videos, // ✅ Videos included in main update
      };

      await updateUser({
        userId: user._id as Id<"users">,
        updates: updateData,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Video handlers (LOCAL STATE ONLY - no separate API calls)
  const addVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      toast.error("Please enter both title and URL");
      return;
    }

    const newVideo: VideoProfileProps = {
      _id: Date.now().toString(), // Temporary ID
      title: newVideoTitle,
      url: newVideoUrl,
      createdAt: Date.now(), // Use timestamp instead of Date object
    };

    setVideos((prev) => [...prev, newVideo]);
    setNewVideoTitle("");
    setNewVideoUrl("");
    setShowVideoModal(false);
    toast.success("Video added! Don't forget to save your profile.");
  };

  const removeVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((video) => video._id !== videoId));
    toast.success("Video removed! Don't forget to save your profile.");
  };

  // Social media handlers
  const addSocialHandle = () => {
    if (newSocialPlatform && newSocialHandle) {
      setHandles([
        ...handles,
        { platform: newSocialPlatform, handle: newSocialHandle },
      ]);
      setNewSocialPlatform("");
      setNewSocialHandle("");
      setShowSocialModal(false);
    }
  };

  const removeSocialHandle = (index: number) => {
    const updatedHandles = [...handles];
    updatedHandles.splice(index, 1);
    setHandles(updatedHandles);
  };

  // Genre handlers
  const addGenre = () => {
    if (newGenre && !genre.includes(newGenre)) {
      setGenre([...genre, newGenre]);
      setNewGenre("");
      setShowGenreModal(false);
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenre(genre.filter((g) => g !== genreToRemove));
  };

  // Account type toggle
  const toggleAccountType = (type: "musician" | "client") => {
    if (type === "musician") {
      setIsMusician(true);
      setIsClient(false);
    } else {
      setIsMusician(false);
      setIsClient(true);
    }
  };

  if (userLoading || !user) {
    return (
      <div
        className={cn(
          "h-screen w-full flex justify-center items-center",
          colors.background
        )}
      >
        <div className="text-center">
          <CircularProgress size={40} style={{ color: colors.text }} />
          <p className={cn("mt-4", colors.textMuted)}>
            Loading profile data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen w-full py-8", colors.background)}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl border p-8 mb-8 bg-gradient-to-br from-amber-500/5 to-purple-500/5",
            colors.card,
            colors.border
          )}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/30"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center border-4 border-amber-400/30",
                      colors.secondaryBackground
                    )}
                  >
                    <User size={32} className={colors.textMuted} />
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-full hover:bg-amber-600 transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <h1 className={cn("text-3xl font-bold mb-2", colors.text)}>
                  {firstname} {lastname}
                </h1>
                <p
                  className={cn(
                    "flex items-center gap-2 mb-3",
                    colors.textMuted
                  )}
                >
                  <Globe size={16} /> @{username}
                </p>
                <div className="flex gap-2">
                  <Badge
                    className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    )}
                  >
                    {isMusician ? "Musician" : isClient ? "Client" : "Member"}
                  </Badge>
                  {user.tier === "pro" && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-500 text-white"
                    >
                      PRO
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Link href={`/profile/${username}`}>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                View Public Profile
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Followers",
              value: user.followers?.length || 0,
              icon: <User size={16} />,
            },
            {
              label: "Following",
              value: user.followings?.length || 0,
              icon: <User size={16} />,
            },
            {
              label: "Reviews",
              value: user.allreviews?.length || 0,
              icon: <Briefcase size={16} />,
            },
            {
              label: isMusician ? "Videos" : "Gigs",
              value: isMusician
                ? videos.length || 0
                : user.monthlyGigsPosted || 0,
              icon: isMusician ? <Music size={16} /> : <Briefcase size={16} />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl p-4 text-center border transition-all hover:scale-105",
                colors.card,
                colors.border
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-purple-500/10 mx-auto w-12 mb-2"
                )}
              >
                {stat.icon}
              </div>
              <p className={cn("text-2xl font-bold mb-1", colors.text)}>
                {stat.value}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Videos Section */}
            {isMusician && user && (
              <SectionContainer
                icon={<Music size={18} />}
                title="Video Profile"
                // action={
                //   <Button
                //     onClick={() => setShowVideoModal(true)}
                //     className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                //   >
                //     <Plus size={16} className="mr-1" /> Add Video
                //   </Button>
                // }
              >
                <VideoProfileComponent
                  videos={videos}
                  onAddVideo={(newVideo: VideoProfileProps) => {
                    const videoWithId: VideoProfileProps = {
                      ...newVideo,
                      _id: Date.now().toString(),
                    };
                    setVideos((prev) => [...prev, videoWithId]);
                  }}
                  onRemoveVideo={(videoId: String) => {
                    setVideos((prev) =>
                      prev.filter((video) => video._id !== videoId)
                    );
                  }}
                  loading={loading}
                  user={user}
                />
              </SectionContainer>
            )}

            {/* About Section */}
            <SectionContainer icon={<User size={18} />} title="About">
              <Textarea
                value={talentbio}
                onChange={(e) => setTalentbio(e.target.value)}
                placeholder="Tell us about yourself, your skills, and your experience..."
                className={cn(
                  "min-h-[120px] resize-none",
                  colors.background,
                  colors.border,
                  colors.text,
                  "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                )}
              />
            </SectionContainer>

            {/* Experience Section */}
            <SectionContainer
              icon={<Briefcase size={18} />}
              title="Experience & Skills"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isMusician && (
                  <>
                    <SelectInput
                      label="Primary Instrument"
                      value={instrument}
                      onChange={setInstrument}
                      options={instruments().map((ins) => ({
                        value: ins.name,
                        label: ins.val,
                      }))}
                    />

                    <SelectInput
                      label="Experience Level"
                      value={experience}
                      onChange={setExperience}
                      options={experiences().map((ex) => ({
                        value: ex.name,
                        label: ex.val,
                      }))}
                    />

                    <div className="md:col-span-2">
                      <Label className={cn("text-sm font-medium", colors.text)}>
                        Music Genres
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {genre.map((g) => (
                          <Badge
                            key={g}
                            variant="outline"
                            className={cn(
                              "flex items-center gap-1",
                              colors.border,
                              colors.text
                            )}
                          >
                            {g}
                            <button
                              onClick={() => removeGenre(g)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                        <button
                          onClick={() => setShowGenreModal(true)}
                          className={cn(
                            "text-amber-500 hover:text-amber-600 text-sm flex items-center",
                            colors.text
                          )}
                        >
                          <Plus size={14} className="mr-1" /> Add Genre
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {isClient && (
                  <div className="md:col-span-2">
                    <TextInput
                      label="Organization"
                      value={organization}
                      onChange={setOrganization}
                      Icon={<Building size={16} />}
                      placeholder="Your company or organization name"
                    />
                  </div>
                )}
              </div>
            </SectionContainer>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <SectionContainer
              icon={<User size={18} />}
              title="Personal Information"
            >
              <div className="space-y-4">
                <TextInput
                  label="First Name"
                  value={firstname}
                  onChange={setFirstname}
                  disabled
                />
                <TextInput
                  label="Last Name"
                  value={lastname}
                  onChange={setLastname}
                  disabled
                />
                <TextInput
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  disabled
                />

                {isMusician && (
                  <div>
                    <Label className={cn("text-sm font-medium", colors.text)}>
                      Date of Birth
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <SelectInput
                        value={age}
                        onChange={setAge}
                        options={daysOfMonth.map((day) => ({
                          value: day.toString(),
                          label: day.toString(),
                        }))}
                        className="w-1/3"
                      />
                      <SelectInput
                        value={month}
                        onChange={setMonth}
                        options={months.map((m) => ({
                          value: m.toLowerCase(),
                          label: m.slice(0, 3),
                        }))}
                        className="w-1/3"
                      />
                      <Input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Year"
                        className={cn(
                          "w-1/3",
                          colors.background,
                          colors.border,
                          colors.text
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </SectionContainer>

            {/* Contact Information */}
            <SectionContainer
              icon={<Mail size={18} />}
              title="Contact Information"
            >
              <div className="space-y-4">
                <TextInput
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  disabled
                  Icon={<Mail size={16} />}
                />
                <TextInput
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  Icon={<Phone size={16} />}
                  placeholder="+1 (123) 456-7890"
                />
              </div>
            </SectionContainer>

            {/* Rates Section (Musicians only) */}
            {isMusician && (
              <SectionContainer
                icon={<DollarSign size={18} />}
                title="Performance Rates"
                action={
                  <button onClick={() => setShowRates(!showRates)}>
                    {showRates ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                }
                onClickHeader={() => setShowRates(!showRates)}
              >
                {showRates && (
                  <div className="space-y-4">
                    <TextInput
                      label="Regular Gigs"
                      value={rate.regular}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          regular: value ?? "",
                        }))
                      }
                      Icon={<Music size={16} />}
                      placeholder="Rate for regular performances"
                    />
                    <TextInput
                      label="Corporate Events"
                      value={rate.corporate}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          corporate: value ?? "",
                        }))
                      }
                      Icon={<Building size={16} />}
                      placeholder="Rate for corporate events"
                    />
                    <TextInput
                      label="Concerts"
                      value={rate.concert}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          concert: value ?? "",
                        }))
                      }
                      Icon={<Calendar size={16} />}
                      placeholder="Rate for concerts"
                    />
                    <TextInput
                      label="Special Functions"
                      value={rate.function}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          function: value ?? "",
                        }))
                      }
                      Icon={<Briefcase size={16} />}
                      placeholder="Rate for special functions"
                    />
                  </div>
                )}
              </SectionContainer>
            )}

            {/* Location Information */}
            <SectionContainer icon={<MapPin size={18} />} title="Location">
              <div className="space-y-4">
                <TextInput
                  label="City"
                  value={city}
                  onChange={setCity}
                  Icon={<MapPin size={16} />}
                />
                <TextInput
                  label="Address"
                  value={address}
                  onChange={setAddress}
                  placeholder="Your full address"
                />
              </div>
            </SectionContainer>

            {/* Social Media */}
            <SectionContainer icon={<Globe size={18} />} title="Social Media">
              <div className="space-y-3">
                {handles.map((handle, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium capitalize",
                          colors.text
                        )}
                      >
                        {handle.platform}:
                      </span>
                      <span className={cn("text-sm", colors.text)}>
                        {handle.handle}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSocialHandle(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowSocialModal(true)}
                  className={cn(
                    "text-amber-500 hover:text-amber-600 text-sm flex items-center",
                    colors.text
                  )}
                >
                  <Plus size={14} className="mr-1" /> Add Social Media
                </button>
              </div>
            </SectionContainer>

            {/* Account Type */}
            <SectionContainer
              icon={<Lock size={18} />}
              title="Account Type"
              className={"pt-6 pb-[52px]"}
            >
              <div className="space-y-4 ">
                <ToggleSwitch
                  label="Musician Account"
                  checked={isMusician}
                  onChange={() => toggleAccountType("musician")}
                />
                <ToggleSwitch
                  label="Client Account"
                  checked={isClient}
                  onChange={() => toggleAccountType("client")}
                />
              </div>
              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end mt-8"
              >
                <Button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 font-semibold"
                >
                  {loading ? (
                    <CircularProgress size={20} style={{ color: "white" }} />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </motion.div>
            </SectionContainer>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        title="Add Social Media"
      >
        <div className="space-y-4">
          <TextInput
            label="Platform"
            value={newSocialPlatform}
            onChange={setNewSocialPlatform}
            placeholder="Instagram, Twitter, YouTube, etc."
          />
          <TextInput
            label="Username/Handle"
            value={newSocialHandle}
            onChange={setNewSocialHandle}
            placeholder="Your username on this platform"
          />
        </div>
        <ModalActions
          onCancel={() => setShowSocialModal(false)}
          onConfirm={addSocialHandle}
          confirmText="Add Platform"
        />
      </Modal>

      <Modal
        isOpen={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        title="Add Music Genre"
      >
        <TextInput
          label="Genre"
          value={newGenre}
          onChange={setNewGenre}
          placeholder="Rock, Jazz, Hip-Hop, Classical, etc."
        />
        <ModalActions
          onCancel={() => setShowGenreModal(false)}
          onConfirm={addGenre}
          confirmText="Add Genre"
        />
      </Modal>

      {/* Video Upload Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="Add Performance Video"
      >
        <div className="space-y-4">
          <TextInput
            label="Video Title"
            value={newVideoTitle}
            onChange={setNewVideoTitle}
            placeholder="My Amazing Performance"
            Icon={<Music size={16} />}
          />
          <TextInput
            label="Video URL"
            value={newVideoUrl}
            onChange={setNewVideoUrl}
            placeholder="https://youtube.com/watch?v=..."
            Icon={<Play size={16} />}
          />
          <div className={cn("p-4 rounded-lg", colors.secondaryBackground)}>
            <p className={cn("text-sm font-medium mb-2", colors.text)}>
              Supported platforms:
            </p>
            <ul className={cn("text-sm space-y-1", colors.textMuted)}>
              <li>• YouTube URLs</li>
              <li>• Vimeo URLs</li>
              <li>• Direct video links (.mp4, .mov, etc.)</li>
            </ul>
          </div>
        </div>
        <ModalActions
          onCancel={() => setShowVideoModal(false)}
          onConfirm={addVideo}
          confirmText="Add Video"
          // confirmDisabled={
          //   !newVideoTitle.trim() || !newVideoUrl.trim() || videoLoading
          // }
        />
      </Modal>
    </div>
  );
};

export default CurrentUserProfile;

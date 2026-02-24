// components/gigs/SimilarGigCard.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Heart } from "lucide-react";

export const SimilarGigCard = ({ gig, onView, isDarkMode }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    onClick={() => onView(gig)}
    className={cn(
      "p-4 rounded-xl border cursor-pointer transition-all",
      "hover:shadow-xl hover:border-purple-500/50",
      isDarkMode
        ? "bg-slate-800/30 border-slate-700 hover:bg-slate-800/50"
        : "bg-white/80 border-slate-200 hover:bg-white",
    )}
  >
    <div className="flex items-start gap-3">
      <Avatar className="w-10 h-10 rounded-lg">
        <AvatarImage src={gig.logo} />
        <AvatarFallback>{gig.title?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4
          className={cn(
            "font-medium text-sm mb-1",
            isDarkMode ? "text-white" : "text-slate-900",
          )}
        >
          {gig.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{gig.location?.split(",")[0] || "Remote"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(gig.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          {gig.price && (
            <div className="flex items-center gap-1 text-emerald-500">
              <DollarSign className="w-3 h-3" />
              <span className="text-sm font-bold">{gig.price}</span>
            </div>
          )}
          {gig.interestedUsers?.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              <Heart className="w-3 h-3 mr-1 text-rose-400" />
              {gig.interestedUsers.length}
            </Badge>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

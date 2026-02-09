import type { ProjectListItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface ProjectCardProps {
  item: ProjectListItem;
}

export function ProjectCard({ item }: ProjectCardProps) {
  const { projects: project, role } = item;
  const navigate = useNavigate();
  const params = item.projects._id;

  return (
    <Card
      className="group hover:shadow-md hover:border-slate-300 cursor-pointer bg-white dark:bg-neutral-900 hover:bg-muted dark:hover:bg-neutral-800 "
      onClick={() => navigate({to:`/project/${params}`}) }
    >
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Header: Name and Role */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate flex-1" title={project.name}>
            {project.name}
          </h3>
          <Badge variant="secondary" className="shrink-0 text-xs font-normal">
            {role.toLowerCase()}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 min-h-10">
          {project.description || "No description provided."}
        </p>

        {/* Footer: Meta Info */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{project.members}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

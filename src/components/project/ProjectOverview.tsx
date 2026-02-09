import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, X, Check, Users, ShieldCheck, User as UserIcon, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { useUpdateProject, projectMembersFetchingQueryOptions, useLeaveProject } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectOverviewProps {
  project: Project;
  isAdmin: boolean;
}

export function ProjectOverview({ project, isAdmin }: ProjectOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-6 lg:h-[calc(100vh-12rem)] lg:overflow-hidden">
      {/* Project Info - Scrollable */}
      <div className="flex-1 min-w-0 lg:overflow-y-auto lg:pr-2">
        <ProjectInfoSection project={project} isAdmin={isAdmin} />
      </div>

      {/* Project Stats - Scrollable */}
      <div className="w-full lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:pl-2">
        <ProjectStatsSection projectId={project._id} project={project} />
      </div>
    </div>
  );
}

// --- Sub-components ---

interface ProjectInfoSectionProps {
  project: Project;
  isAdmin: boolean;
}

function ProjectInfoSection({ project, isAdmin }: ProjectInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const updateProjectMutation = useUpdateProject(project._id);

  const handleSave = () => {
    updateProjectMutation.mutate({ name, description });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(project.name);
    setDescription(project.description || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-1">
        <div className="space-y-1">
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Basic details about this project</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isAdmin && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {!isEditing && <LeaveProjectButton projectId={project._id} />}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">PROJECT NAME</label>
              <Input value={name} className="mt-4" onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">DESCRIPTION</label>
              <Textarea
                value={description}
                className="mt-4"
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground">PROJECT NAME</h4>
              <p className="text-xl font-bold tracking-tight">{project.name}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">DESCRIPTION</h4>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {project.description || "No description provided."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface ProjectStatsSectionProps {
  projectId: string;
  project?: Project;
}

function ProjectStatsSection({ projectId, project }: ProjectStatsSectionProps) {
  const { data: members, isLoading } = useQuery(projectMembersFetchingQueryOptions(projectId));

  if (isLoading) {
    return <StatsSkeleton />;
  }

  const totalMembers = members?.length || 0;
  const admins = members?.filter((m) => m.role === "admin").length || 0;
  const regularMembers = members?.filter((m) => m.role === "member").length || 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
              <Users className="mr-2 h-5 w-5" />
              Total Members
            </div>
            <div className="text-2xl font-extrabold">{totalMembers}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
              <ShieldCheck className="mr-2 h-5 w-5 text-purple-500" />
              Admins
            </div>
            <div className="text-xl font-bold">{admins}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
              <UserIcon className="mr-2 h-5 w-5 text-blue-500" />
              Members
            </div>
            <div className="text-xl font-bold">{regularMembers}</div>
          </div>
        </div>

        {project && (
          <>
            <div className="pt-6 border-t border-border/50">
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(project.createdAt)}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  Updated
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Project Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={i > 1 ? "pt-4 border-t" : ""}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface LeaveProjectButtonProps {
  projectId: string;
}

function LeaveProjectButton({ projectId }: LeaveProjectButtonProps) {
  const { mutate: leaveProject } = useLeaveProject(projectId);

  const handleConfirm = () => {
    leaveProject();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Leave
          </Button>
        }
      ></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You will lose access to this project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

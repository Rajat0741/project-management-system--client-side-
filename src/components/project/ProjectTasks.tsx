import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trash2,
  Download,
  FileImage,
  FileText,
  Paperclip,
  Pencil,
} from "lucide-react";
import {
  tasksQueryOptions,
  taskByIdQueryOptions,
  useDeleteTask,
  useToggleSubtaskStatus,
  useUpdateSubtask,
  useDeleteSubtask,
} from "@/hooks/useTasks";
import { TaskStatusLabels } from "@/schemas/task.schema";
import { CreateTaskButton } from "./CreateTaskButton";
import { EditTaskButton } from "./EditTaskDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadAttachmentsButton } from "./DownloadAttachmentsButton";
import type { Task, SubTask, ProjectMemberWithDetails } from "@/types";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemMedia } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ProjectTasksProps {
  projectId: string;
  members: ProjectMemberWithDetails[];
  isAdmin: boolean;
}

export function ProjectTasks({ projectId, members, isAdmin }: ProjectTasksProps) {
  const { data: tasks, isLoading, isError } = useQuery(tasksQueryOptions(projectId));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center border rounded-lg border-dashed">
        <p className="text-muted-foreground text-lg">Error loading tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div>
          <CardTitle className="text-xl font-semibold">Tasks</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {tasks?.length || 0} task{tasks?.length !== 1 ? "s" : ""} in this project
          </CardDescription>
        </div>
        {isAdmin && <CreateTaskButton projectId={projectId} members={members} />}
      </CardHeader>

      <CardContent>
        {/* Task List */}
        {!tasks || tasks.length === 0 ? (
          <div className="p-12 text-center border rounded-lg border-dashed">
            <p className="text-muted-foreground text-lg">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first task to get started</p>
          </div>
        ) : (
          <ItemGroup>
            {tasks.map((task) => (
              <TaskItem key={task._id} task={task} projectId={projectId} members={members} isAdmin={isAdmin} />
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

// Status badge variant mapping
const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
};

interface TaskItemProps {
  task: Task;
  projectId: string;
  members: ProjectMemberWithDetails[];
  isAdmin: boolean;
}

function TaskItem({ task, projectId, isAdmin }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTask = useDeleteTask(projectId);

  // Lazy load task details (including subtasks) when expanded
  const { data: taskDetails, isLoading: isLoadingDetails } = useQuery({
    ...taskByIdQueryOptions(projectId, task._id),
    enabled: isExpanded,
  });

  const fullTask = taskDetails || task;

  const handleDelete = () => {
    deleteTask.mutate(task._id, {
      onSuccess: () => setShowDeleteDialog(false),
    });
  };

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Item variant="outline" className="flex-col items-stretch ">
          {/* Task Header Row */}
          <div className="flex items-center gap-3 w-full">
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="shrink-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              }
            />

            <ItemContent className="min-w-0 flex-1">
              <ItemTitle>{task.title}</ItemTitle>
              {task.description && <ItemDescription className="line-clamp-1">{task.description}</ItemDescription>}
            </ItemContent>

            <ItemActions>
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}

              <Badge variant={statusVariants[task.status] || "outline"}>
                {TaskStatusLabels[task.status] || task.status}
              </Badge>

              {isAdmin && (
                <>
                  <EditTaskButton task={fullTask} projectId={projectId} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </ItemActions>
          </div>

          {/* Expanded Content */}
          <CollapsibleContent>
            <div className="pt-3 mt-3 border-t space-y-4">
              {isLoadingDetails ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : (
                <TaskDetails projectId={projectId} task={fullTask} isAdmin={isAdmin} />
              )}
            </div>
          </CollapsibleContent>
        </Item>
      </Collapsible>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{task.title}</strong>? This will also delete all subtasks and
              attachments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface TaskDetailsProps {
  projectId: string;
  task: Task;
  isAdmin: boolean;
}

function TaskDetails({ projectId, task, isAdmin }: TaskDetailsProps) {
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const toggleSubtaskStatus = useToggleSubtaskStatus(projectId, task._id);
  const updateSubtask = useUpdateSubtask(projectId, task._id);
  const deleteSubtask = useDeleteSubtask(projectId, task._id);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;

  const toggleSubtask = (subtask: SubTask) => {
    toggleSubtaskStatus.mutate({
      subtaskId: subtask._id,
      isCompleted: !subtask.isCompleted,
    });
  };

  const startEditSubtask = (subtask: SubTask) => {
    setEditingSubtaskId(subtask._id);
    setEditingTitle(subtask.title);
  };

  const saveSubtaskEdit = (subtaskId: string) => {
    if (editingTitle.trim()) {
      updateSubtask.mutate({ subtaskId, data: { title: editingTitle } });
    }
    setEditingSubtaskId(null);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask.mutate(subtaskId);
  };

  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    if (url.match(/\.pdf$/i)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getFilename = (url: string) => {
    try {
      return decodeURIComponent(new URL(url).pathname.split("/").pop() || "file");
    } catch {
      return "file";
    }
  };

  if (!task.description && !hasSubtasks && !hasAttachments) {
    return <p className="text-sm text-muted-foreground text-center py-2">No additional details</p>;
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      {task.description && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
          <p className="text-sm">{task.description}</p>
        </div>
      )}

      {/* Subtasks */}
      {hasSubtasks && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Subtasks ({task.subtasks?.filter((s) => s.isCompleted).length}/{task.subtasks?.length})
          </p>
          <ItemGroup className="gap-1">
            {task.subtasks?.map((subtask) => (
              <Item
                key={subtask._id}
                size="xs"
                variant="muted"
                className={cn("items-center", subtask.isCompleted && "opacity-50")}
              >
                <ItemMedia
                  variant="icon"
                  className="cursor-pointer hover:bg-accent self-center! translate-y-0!"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubtask(subtask);
                  }}
                >
                  {subtask.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </ItemMedia>
                <ItemContent>
                  {editingSubtaskId === subtask._id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => saveSubtaskEdit(subtask._id)}
                      onKeyDown={(e) => e.key === "Enter" && saveSubtaskEdit(subtask._id)}
                      autoFocus
                      className="h-6 text-sm"
                    />
                  ) : (
                    <ItemTitle className={cn(subtask.isCompleted && "line-through")}>{subtask.title}</ItemTitle>
                  )}
                </ItemContent>
                {isAdmin && editingSubtaskId !== subtask._id && (
                  <ItemActions>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditSubtask(subtask);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubtask(subtask._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ItemActions>
                )}
              </Item>
            ))}
          </ItemGroup>
        </div>
      )}

      {hasAttachments && hasSubtasks && <Separator />}

      {/* Attachments */}
      {hasAttachments && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Attachments ({task.attachments.length})</p>
            <DownloadAttachmentsButton attachments={task.attachments} fileName={`${task.title}-attachments`} />
          </div>
          <ItemGroup className="gap-1">
            {task.attachments.map((att, i) => (
              <Item key={i} size="xs" variant="muted" className="items-center">
                <ItemMedia variant="icon" className="self-center! translate-y-0!">{getFileIcon(att.url)}</ItemMedia>
                <ItemContent>
                  <ItemTitle>{getFilename(att.url)}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <a
                    href={`${att.url}?ik-attachment=true`}
                    className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
                    download
                    target="_blank"
                    title="download"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      )}
    </div>
  );
}

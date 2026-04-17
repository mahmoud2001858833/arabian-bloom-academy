import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  is_free: boolean;
  level: string;
  is_published: boolean;
  created_at: string;
}

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const levelLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

interface SortableRowProps {
  course: Course;
  selectedId?: string;
  onSelect: (c: Course) => void;
  onTogglePublish: (id: string, current: boolean) => void;
  onEdit: (c: Course) => void;
  onDelete: (id: string) => void;
}

const SortableRow = ({
  course,
  selectedId,
  onSelect,
  onTogglePublish,
  onEdit,
  onDelete,
}: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: isDragging ? 0.5 : 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onSelect(course)}
      className={`p-4 cursor-pointer transition-all ${
        selectedId === course.id
          ? 'bg-accent/20 border-r-4 border-accent'
          : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="touch-none cursor-grab active:cursor-grabbing p-1 text-white/40 hover:text-accent transition-colors"
          aria-label="اسحب لإعادة الترتيب"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white truncate">{course.title}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              className={`text-xs ${
                course.is_published
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/10 text-white/60 border-white/20'
              }`}
            >
              {course.is_published ? 'منشور' : 'مسودة'}
            </Badge>
            <Badge className={`text-xs border ${levelColors[course.level] || ''}`}>
              {levelLabels[course.level] || course.level}
            </Badge>
            {course.is_free ? (
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">مجاني</Badge>
            ) : (
              <Badge className="bg-white/10 text-white/70 border-white/20 text-xs">${course.price}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/60 hover:text-accent hover:bg-accent/10"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublish(course.id, course.is_published);
            }}
          >
            {course.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/60 hover:text-accent hover:bg-accent/10"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/60 hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface SortableCoursesListProps {
  courses: Course[];
  setCourses: (c: Course[]) => void;
  selectedId?: string;
  onSelect: (c: Course) => void;
  onTogglePublish: (id: string, current: boolean) => void;
  onEdit: (c: Course) => void;
  onDelete: (id: string) => void;
}

const SortableCoursesList = ({
  courses,
  setCourses,
  selectedId,
  onSelect,
  onTogglePublish,
  onEdit,
  onDelete,
}: SortableCoursesListProps) => {
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = courses.findIndex((c) => c.id === active.id);
    const newIndex = courses.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(courses, oldIndex, newIndex);
    setCourses(reordered); // optimistic

    // Persist new sort_order for all affected items (simple: update all)
    try {
      const updates = reordered.map((c, idx) =>
        supabase.from('courses').update({ sort_order: idx }).eq('id', c.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      toast({ title: 'تم الحفظ', description: 'تم تحديث ترتيب الكورسات' });
    } catch (e) {
      console.error('Reorder failed:', e);
      toast({ title: 'خطأ', description: 'فشل حفظ الترتيب', variant: 'destructive' });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="divide-y divide-white/10">
          {courses.map((course) => (
            <SortableRow
              key={course.id}
              course={course}
              selectedId={selectedId}
              onSelect={onSelect}
              onTogglePublish={onTogglePublish}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableCoursesList;

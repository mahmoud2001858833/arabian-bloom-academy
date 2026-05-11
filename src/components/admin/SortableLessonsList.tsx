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
import { Edit, FileUp, GripVertical, HelpCircle, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
  duration_minutes: number;
  order_index: number;
}

interface SortableRowProps {
  lesson: Lesson;
  index: number;
  onEdit: (l: Lesson) => void;
  onDelete: (id: string) => void;
  onQuiz: (l: Lesson) => void;
}

const SortableRow = ({ lesson, index, onEdit, onDelete, onQuiz }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

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
      className="p-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 text-white/40 hover:text-accent transition-colors"
          aria-label="اسحب لإعادة الترتيب"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20 text-accent font-black text-lg">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white">{lesson.title}</h4>
          <p className="text-sm text-white/50 truncate">{lesson.description}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
            {lesson.duration_minutes > 0 && <span>{lesson.duration_minutes} دقيقة</span>}
            {lesson.video_url && (
              <Badge className="bg-primary/20 text-primary-foreground border-0 text-xs">
                <Sparkles className="h-3 w-3 ml-1" />
                فيديو
              </Badge>
            )}
            {lesson.pdf_url && (
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                <FileUp className="h-3 w-3 ml-1" />
                PDF
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-white/60 hover:text-blue-400 hover:bg-blue-500/10"
            onClick={() => onQuiz(lesson)}
            title="إدارة الأسئلة"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-white/60 hover:text-accent hover:bg-accent/10"
            onClick={() => onEdit(lesson)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-white/60 hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(lesson.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface Props {
  lessons: Lesson[];
  setLessons: (l: Lesson[]) => void;
  onEdit: (l: Lesson) => void;
  onDelete: (id: string) => void;
  onQuiz: (l: Lesson) => void;
}

const SortableLessonsList = ({ lessons, setLessons, onEdit, onDelete, onQuiz }: Props) => {
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(lessons, oldIndex, newIndex);
    setLessons(reordered);

    try {
      const updates = reordered.map((l, idx) =>
        supabase.from('lessons').update({ order_index: idx }).eq('id', l.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      toast({ title: 'تم الحفظ', description: 'تم تحديث ترتيب الدروس' });
    } catch (e) {
      console.error('Reorder lessons failed:', e);
      toast({ title: 'خطأ', description: 'فشل حفظ الترتيب', variant: 'destructive' });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="divide-y divide-white/10">
          {lessons.map((lesson, index) => (
            <SortableRow
              key={lesson.id}
              lesson={lesson as Lesson}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onQuiz={onQuiz}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableLessonsList;
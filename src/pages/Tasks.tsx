import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
}

const statusOptions = ['pending', 'in_progress', 'completed'];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(statusOptions[0]);
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) console.error(error);
    else setTasks(data as Task[]);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setStatus(statusOptions[0]);
    setDueDate(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      status,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
    };
    if (editing) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editing.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('tasks').insert(payload);
      if (error) console.error(error);
    }
    await fetchTasks();
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditing(task);
    setTitle(task.title);
    setStatus(task.status);
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error(error);
    await fetchTasks();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editing ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
            />
            <Button type="submit" className="w-full">
              {editing ? 'Atualizar' : 'Criar'}
            </Button>
          </form>
        </CardContent>
        {editing && (
          <CardFooter>
            <Button variant="outline" onClick={resetForm} className="w-full">
              Cancelar
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Status: {task.status.replace('_', ' ')}</p>
              {task.due_date && <p className="text-sm">Conclução: {task.due_date}</p>}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

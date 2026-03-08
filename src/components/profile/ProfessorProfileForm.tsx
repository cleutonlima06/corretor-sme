"use client"

import { useState, useEffect } from "react"
import { useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserCircle, Save, School, GraduationCap, Calendar, BookOpen } from "lucide-react"

interface ProfessorProfileFormProps {
  userId: string;
  initialData?: any;
}

export function ProfessorProfileForm({ userId, initialData }: ProfessorProfileFormProps) {
  const [formData, setFormData] = useState({
    schoolId: "",
    classroomId: "",
    academicYear: "",
    subjectId: "",
  });
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        schoolId: initialData.schoolId || "",
        classroomId: initialData.classroomId || "",
        academicYear: initialData.academicYear?.toString() || "",
        subjectId: initialData.subjectId || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docRef = doc(db, 'users', userId, 'professorProfile', userId);
    
    setDocumentNonBlocking(docRef, {
      ...formData,
      id: userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({
      title: "Perfil atualizado",
      description: "Suas informações de professor foram salvas.",
    });
  };

  return (
    <Card className="shadow-md border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          Perfil do Professor
        </CardTitle>
        <CardDescription>Configure os dados da sua escola e turma atual.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center gap-2">
                <School className="h-4 w-4 text-primary" /> Escola
              </Label>
              <Input
                id="school"
                placeholder="Ex: Escola Municipal..."
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroom" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Turma
              </Label>
              <Input
                id="classroom"
                placeholder="Ex: 5º Ano A"
                value={formData.classroomId}
                onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Ano Letivo
              </Label>
              <Input
                id="year"
                type="number"
                placeholder="Ex: 2024"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Disciplina
              </Label>
              <Input
                id="subject"
                placeholder="Ex: Matemática"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2">
            <Save className="h-4 w-4" /> Salvar Configurações de Perfil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


"use client"

import { useState, useEffect, useRef } from "react"
import { useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserCircle, Save, School, GraduationCap, Calendar, BookOpen, UserPlus, Trash2, Users, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

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
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      setStudentNames(initialData.studentList || []);
    }
  }, [initialData]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const profileRef = doc(db, 'users', userId, 'professorProfile', userId);
    
    const dataToSave = {
      ...formData,
      studentList: studentNames,
      id: userId,
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(profileRef, dataToSave, { merge: true });

    if (formData.classroomId && formData.schoolId) {
      const classId = `${formData.schoolId}-${formData.classroomId}-${formData.academicYear}-${formData.subjectId}`.replace(/\s+/g, '_');
      const classRef = doc(db, 'users', userId, 'classrooms', classId);
      
      setDocumentNonBlocking(classRef, {
        id: classId,
        schoolId: formData.schoolId,
        classroomId: formData.classroomId,
        academicYear: formData.academicYear,
        subjectId: formData.subjectId,
        professorId: userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    toast({
      title: "Configurações Salvas",
      description: "As informações da turma foram atualizadas e registradas no histórico.",
    });
  };

  const handleAddStudent = () => {
    if (!newName.trim()) return;
    if (studentNames.includes(newName.trim())) {
      toast({ variant: "destructive", title: "Nome já existe", description: "Este aluno já está na lista." });
      return;
    }
    const updatedList = [...studentNames, newName.trim()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    setStudentNames(updatedList);
    setNewName("");
  };

  const handleRemoveStudent = (nameToRemove: string) => {
    setStudentNames(studentNames.filter(n => n !== nameToRemove));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast({ variant: "destructive", title: "Arquivo vazio", description: "O arquivo selecionado não contém dados válidos." });
          return;
        }

        const importedNames: string[] = jsonData
          .map(row => {
            const key = Object.keys(row).find(k => k.toLowerCase() === 'nome');
            return key ? String(row[key]).trim() : null;
          })
          .filter((name): name is string => !!name && name.length > 0);

        if (importedNames.length === 0) {
          toast({ variant: "destructive", title: "Coluna não encontrada", description: "Certifique-se de que o arquivo possui uma coluna chamada 'Nome'." });
          return;
        }

        const combined = Array.from(new Set([...studentNames, ...importedNames])).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        setStudentNames(combined);
        
        toast({ title: "Importação concluída", description: `${importedNames.length} alunos foram adicionados.` });
      } catch (error) {
        console.error("Erro na importação:", error);
        toast({ variant: "destructive", title: "Erro no processamento", description: "Não foi possível ler o arquivo." });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-md border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Perfil do Professor
          </CardTitle>
          <CardDescription>Configure os dados da sua escola e turma atual.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
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

            <div className="pt-4">
              <Button type="submit" className="w-full gap-2 py-6 text-lg font-bold shadow-sm">
                <Save className="h-5 w-5" /> Salvar Configurações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Alunos da Turma
          </CardTitle>
          <CardDescription>Cadastre ou importe os nomes dos alunos que aparecerão na aba de lançamentos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newStudent">Cadastrar Aluno Individualmente</Label>
              <div className="flex gap-2">
                <Input
                  id="newStudent"
                  placeholder="Digite o nome completo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
                <Button onClick={handleAddStudent} size="icon" className="shrink-0">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 shrink-0">
              <Label>Cadastro em Massa</Label>
              <Button variant="outline" onClick={handleImportClick} className="w-full gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <FileSpreadsheet className="h-4 w-4 text-primary" /> Importar Excel
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileImport}
              />
            </div>
          </div>

          <div className="border rounded-lg bg-slate-50/50">
            <div className="p-3 border-b bg-white rounded-t-lg flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Alunos Cadastrados ({studentNames.length})</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {studentNames.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground italic">Nenhum aluno cadastrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {studentNames.map((name, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white border rounded-md group hover:border-primary/30 transition-colors">
                      <span className="text-sm truncate font-medium">{name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveStudent(name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

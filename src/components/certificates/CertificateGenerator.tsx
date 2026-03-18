"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GraduationCap, Award, FileDown, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

// Importação dinâmica do html2pdf apenas no lado do cliente
const getHtml2Pdf = async () => {
  if (typeof window !== "undefined") {
    // @ts-ignore
    return (await import("html2pdf.js")).default;
  }
  return null;
};

export function CertificateGenerator() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    studentName: "",
    activityName: "",
    date: new Date().toLocaleDateString('pt-BR'),
  });
  
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleGenerate = () => {
    if (!formData.studentName || !formData.activityName || !formData.date) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do formulário."
      });
      return;
    }

    const verificationCode = generateCode();
    const certData = {
      ...formData,
      verificationCode,
      schoolName: "Escola ISP",
      professorId: user?.uid,
      createdAt: new Date().toISOString()
    };

    setGeneratedData(certData);

    // Salvar no Firebase
    if (user) {
      const colRef = collection(db, 'users', user.uid, 'certificates');
      addDocumentNonBlocking(colRef, certData);
    }

    toast({
      title: "Certificado Gerado",
      description: "O modelo foi preenchido e salvo com sucesso."
    });
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setLoading(true);
    try {
      const html2pdf = await getHtml2Pdf();
      if (!html2pdf) throw new Error("Falha ao carregar biblioteca PDF");

      const element = certificateRef.current;
      const opt = {
        margin: 10,
        filename: `certificado_${formData.studentName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Download Concluído",
        description: "O arquivo PDF foi gerado e baixado."
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro no PDF",
        description: "Não foi possível gerar o arquivo PDF. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <Card className="lg:col-span-1 shadow-md border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Dados do Certificado
            </CardTitle>
            <CardDescription>Preencha os dados para gerar o documento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Nome do Aluno</Label>
              <Input
                id="studentName"
                placeholder="Ex: João Silva"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity">Nome da Atividade</Label>
              <Input
                id="activity"
                placeholder="Ex: Avaliação Bimestral de Matemática"
                value={formData.activityName}
                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                placeholder="Ex: 25 de Outubro de 2024"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            
            <div className="pt-4 flex flex-col gap-2">
              <Button onClick={handleGenerate} className="w-full gap-2 font-bold">
                <Award className="h-4 w-4" /> Gerar Certificado
              </Button>
              {generatedData && (
                <Button 
                  onClick={handleDownloadPDF} 
                  variant="outline" 
                  disabled={loading}
                  className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  Baixar PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview do Certificado */}
        <div className="lg:col-span-2">
          {!generatedData ? (
            <Card className="h-full flex flex-col items-center justify-center border-dashed border-2 bg-slate-50 text-muted-foreground p-12 text-center">
              <Award className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-bold">Pré-visualização do Certificado</h3>
              <p className="text-sm max-w-xs mt-2">Preencha o formulário ao lado e clique em "Gerar Certificado" para ver o resultado aqui.</p>
            </Card>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-2 rounded-xl shadow-2xl border-4 border-primary/20 overflow-hidden relative">
                {/* O elemento que será convertido em PDF */}
                <div 
                  ref={certificateRef}
                  className="bg-white border-[12px] border-primary p-12 text-center space-y-8 min-h-[500px] flex flex-col justify-center relative"
                  style={{ backgroundImage: 'radial-gradient(circle at center, #f0fdf4 0%, #ffffff 100%)' }}
                >
                  {/* Selo decorativo */}
                  <div className="absolute top-8 right-8 text-primary/10">
                    <Award size={120} />
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-[0.2em] text-primary">CERTIFICADO</h1>
                    <div className="h-1 w-32 bg-primary/30 mx-auto rounded-full" />
                  </div>

                  <div className="space-y-6">
                    <p className="text-lg text-slate-600 uppercase tracking-widest font-medium">Certificamos que</p>
                    <h2 className="text-4xl font-bold text-slate-800 underline decoration-primary decoration-4 underline-offset-8">
                      {generatedData.studentName}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      Concluiu com êxito a atividade <span className="font-bold text-primary">"{generatedData.activityName}"</span> realizada em <span className="font-bold">{generatedData.date}</span>, demonstrando excelente desempenho e dedicação acadêmica.
                    </p>
                  </div>

                  <div className="pt-12 grid grid-cols-2 gap-12 items-end">
                    <div className="space-y-1">
                      <div className="h-px bg-slate-400 w-full mb-2" />
                      <p className="text-sm font-bold text-slate-800">{generatedData.schoolName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Instituição de Ensino</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Código de Autenticidade</p>
                      <p className="text-xs font-mono font-bold text-primary bg-primary/5 inline-block px-2 py-1 rounded">
                        #{generatedData.verificationCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" /> 
                Este é um documento digital verificado pelo sistema AvaLink Poranga.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

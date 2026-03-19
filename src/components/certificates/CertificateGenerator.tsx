"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GraduationCap, Award, FileDown, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { QRCodeCanvas } from "qrcode.react"

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
      institution: "Maria Pereira da Silva",
      department: "Secretaria de Educação de Poranga",
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
      description: "O modelo institucional foi preenchido com sucesso."
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
        margin: 0,
        filename: `certificado_${formData.studentName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Download Concluído",
        description: "O arquivo PDF foi gerado em alta definição."
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Formulário */}
        <Card className="lg:col-span-1 shadow-md border-primary/10 no-print">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Dados do Certificado
            </CardTitle>
            <CardDescription>Emissão institucional de Poranga.</CardDescription>
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
              <Label htmlFor="activity">Atividade/Evento</Label>
              <Input
                id="activity"
                placeholder="Ex: Olimpíada de Matemática"
                value={formData.activityName}
                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data de Emissão</Label>
              <Input
                id="date"
                placeholder="Ex: 18 de Março de 2026"
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
                  Baixar PDF (A4)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview do Certificado */}
        <div className="lg:col-span-3 overflow-auto flex justify-center bg-slate-100 p-8 rounded-xl border-2 border-dashed">
          {!generatedData ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Award className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-bold">Pré-visualização</h3>
              <p className="text-sm max-w-xs mt-2">Os certificados são gerados em formato A4 Paisagem com design oficial.</p>
            </div>
          ) : (
            <div 
              className="bg-white shadow-2xl origin-top"
              style={{ width: '297mm', height: '210mm' }}
            >
              <div 
                id="certificado"
                ref={certificateRef}
                className="relative bg-white overflow-hidden flex flex-col items-center justify-center p-0"
                style={{ width: '303mm', height: '216mm', marginLeft: '-3mm', marginTop: '-3mm' }}
              >
                {/* FUNDO E BORDAS FULL BLEED */}
                <div 
                  className="absolute inset-0 border-[15mm] border-primary" 
                  style={{ backgroundImage: 'radial-gradient(circle at center, #fdfdfd 0%, #f8fafc 100%)' }}
                />
                
                {/* DETALHES DOURADOS */}
                <div className="absolute inset-[18mm] border border-yellow-500/30 pointer-events-none" />

                {/* SELO SUPERIOR */}
                <div className="absolute top-[25mm] right-[25mm] opacity-10">
                  <Award size={150} className="text-primary" />
                </div>

                {/* CONTEÚDO PRINCIPAL */}
                <div className="relative z-10 text-center space-y-10 w-[240mm]">
                  <div className="space-y-2">
                    <h1 className="text-7xl font-black tracking-[0.3em] text-primary">CERTIFICADO</h1>
                    <div className="h-1 w-48 bg-yellow-500/50 mx-auto rounded-full" />
                  </div>

                  <div className="space-y-8">
                    <p className="text-xl text-slate-500 uppercase tracking-[0.4em] font-medium">Certificamos que</p>
                    <h2 className="text-6xl font-bold text-slate-800 underline decoration-yellow-500/40 decoration-4 underline-offset-8 font-serif italic">
                      {generatedData.studentName}
                    </h2>
                    <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                      Concluiu com êxito a atividade <span className="font-bold text-primary">"{generatedData.activityName}"</span> realizada em <span className="font-bold">{generatedData.date}</span>, demonstrando excelente desempenho e dedicação acadêmica.
                    </p>
                  </div>

                  {/* RODAPÉ E QR CODE */}
                  <div className="pt-16 grid grid-cols-3 gap-8 items-end px-12">
                    <div className="text-left space-y-2">
                      <div className="h-px bg-slate-400 w-full mb-2" />
                      <p className="text-lg font-bold text-slate-800">Secretaria de Educação de Poranga</p>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest">{generatedData.institution}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Autenticação</p>
                      <p className="text-xs font-mono font-bold text-primary bg-primary/5 px-3 py-1 rounded border border-primary/20">
                        #{generatedData.verificationCode}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="p-2 bg-white border-2 border-slate-100 rounded-lg shadow-sm">
                        <QRCodeCanvas 
                          value={`https://avalink-poranga.edu/verify/${generatedData.verificationCode}`} 
                          size={80}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-[8px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Validação via QR Code</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
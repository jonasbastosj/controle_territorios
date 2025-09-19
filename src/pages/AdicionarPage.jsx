import React, { useState, useEffect } from "react";
import { Address } from "@/entities/Address";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Home, Save, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdicionarPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [formData, setFormData] = useState({
    address: "",
    territory: "",
    status: "falta_pregar",
    contact_name: "",
    phone: "",
    observations: "",
    best_time: "",
    last_visit_date: "",
    visit_count: 0,
    assigned_to_email: "",
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setFormData((prev) => ({ ...prev, assigned_to_email: user.email }));

        if (user.role === "admin") {
          const allUsers = await User.list();
          setUsersList(allUsers);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }
    loadInitialData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Address.create(formData);
      navigate(createPageUrl("Enderecos"));
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Enderecos"))}
            className="bg-white/80 hover:bg-white shadow-lg border-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
              Adicionar Endereço
            </h1>
            <p className="text-slate-600">
              Cadastre um novo endereço para visita
            </p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-white/50">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-800">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              Informações do Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {currentUser?.role === "admin" && (
                <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                  <Label
                    htmlFor="assigned_to_email"
                    className="text-slate-700 font-medium flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" /> Atribuir a Usuário
                  </Label>
                  <Select
                    value={formData.assigned_to_email}
                    onValueChange={(value) =>
                      handleInputChange("assigned_to_email", value)
                    }
                  >
                    <SelectTrigger className="py-3 border-blue-200 focus:border-blue-400 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {usersList.map((user) => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-700 font-medium">
                    Endereço Completo *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className="py-3 border-slate-200 focus:border-blue-400 bg-white/70"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territory" className="text-slate-700 font-medium">
                    Território *
                  </Label>
                  <Input
                    id="territory"
                    value={formData.territory}
                    onChange={(e) => handleInputChange("territory", e.target.value)}
                    placeholder="Nome do território ou área"
                    className="py-3 border-slate-200 focus:border-blue-400 bg-white/70"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_name" className="text-slate-700 font-medium">
                    Nome do Contato
                  </Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      handleInputChange("contact_name", e.target.value)
                    }
                    placeholder="Nome da pessoa"
                    className="py-3 border-slate-200 focus:border-blue-400 bg-white/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="py-3 border-slate-200 focus:border-blue-400 bg-white/70"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-700 font-medium">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="py-3 border-slate-200 focus:border-blue-400 bg-white/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="falta_pregar">Falta Pregar</SelectItem>
                      <SelectItem value="pregado">Pregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="best_time" className="text-slate-700 font-medium">
                    Melhor Horário
                  </Label>
                  <Input
                    id="best_time"
                    value={formData.best_time}
                    onChange={(e) => handleInputChange("best_time", e.target.value)}
                    placeholder="Ex: Manhã, Tarde, Noite"
                    className="py-3 border-slate-200 focus:border-blue-400 bg-white/70"
                  />
                </div>
              </div>

              {formData.status === "pregado" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="last_visit_date"
                    className="text-slate-700 font-medium"
                  >
                    Data da Última Visita
                  </Label>
                  <Input
                    id="last_visit_date"
                    type="date"
                    value={formData.last_visit_date}
                    onChange={(e) =>
                      handleInputChange("last_visit_date", e.target.value)
                    }
                    className="py-3 border-slate-200 focus:border-blue-400 bg-white/70"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observations" className="text-slate-700 font-medium">
                  Observações
                </Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) =>
                    handleInputChange("observations", e.target.value)
                  }
                  placeholder="Anotações importantes sobre este endereço..."
                  rows={4}
                  className="border-slate-200 focus:border-blue-400 bg-white/70 resize-none"
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.address ||
                    !formData.territory ||
                    !formData.assigned_to_email
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                >
                  {isSubmitting ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" /> Salvar Endereço
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

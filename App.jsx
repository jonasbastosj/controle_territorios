// App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import _ from "lodash";
import { format } from "date-fns";
import {
  Plus, Search, CheckCircle, ArrowLeft, Home, User as UserIcon,
  MapPin, Phone, Clock, MessageSquare, Calendar, Repeat, Filter, AlertCircle
} from "lucide-react";

// -------------------- ENTITIES --------------------
const Address = {
  list: async () => JSON.parse(localStorage.getItem("addresses") || "[]"),
  filter: async (query) => {
    const all = JSON.parse(localStorage.getItem("addresses") || "[]");
    return all.filter(addr => addr.assigned_to_email === query.assigned_to_email);
  },
  create: async (data) => {
    const all = JSON.parse(localStorage.getItem("addresses") || "[]");
    data.id = Date.now();
    all.push(data);
    localStorage.setItem("addresses", JSON.stringify(all));
  },
  update: async (id, data) => {
    let all = JSON.parse(localStorage.getItem("addresses") || "[]");
    all = all.map(addr => addr.id === id ? data : addr);
    localStorage.setItem("addresses", JSON.stringify(all));
  }
};

const User = {
  me: async () => ({ email: "user@example.com", role: "admin", full_name: "Admin User" }),
  list: async () => [{ email: "user@example.com", full_name: "Admin User", role: "admin" }]
};

// -------------------- UI COMPONENTS --------------------
const Button = ({ children, ...props }) => (
  <button {...props} className={`px-4 py-2 rounded ${props.className || ""}`}>{children}</button>
);
const Input = (props) => <input {...props} className={`border rounded px-3 py-2 ${props.className || ""}`} />;
const Textarea = (props) => <textarea {...props} className={`border rounded px-3 py-2 ${props.className || ""}`} />;
const Label = (props) => <label {...props} className={`block mb-1 ${props.className || ""}`} />;
const Card = ({ children, className }) => <div className={`border rounded shadow p-4 ${className || ""}`}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={`border-b pb-2 mb-2 ${className || ""}`}>{children}</div>;
const CardContent = ({ children, className }) => <div className={className}>{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={className}>{children}</h3>;
const Badge = ({ children, className }) => <span className={`px-2 py-1 rounded text-xs ${className || ""}`}>{children}</span>;
const Select = ({ value, onValueChange, children }) => (
  <select value={value} onChange={e => onValueChange(e.target.value)} className="border rounded px-2 py-1">{children}</select>
);
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

// -------------------- ADDRESS COMPONENTS --------------------
const AddressStats = ({ addresses }) => {
  const totalAddresses = addresses.length;
  const pregados = addresses.filter(a => a.status === "pregado").length;
  const faltaPregar = addresses.filter(a => a.status === "falta_pregar").length;
  const territories = new Set(addresses.map(a => a.territory)).size;

  const stats = [
    { title: "Total", value: totalAddresses, icon: Home, bgColor: "bg-blue-500 text-white" },
    { title: "Pregados", value: pregados, icon: CheckCircle, bgColor: "bg-green-500 text-white" },
    { title: "Falta Pregar", value: faltaPregar, icon: Clock, bgColor: "bg-orange-500 text-white" },
    { title: "Territórios", value: territories, icon: MapPin, bgColor: "bg-purple-500 text-white" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s,i) => (
        <Card key={i} className="p-4 text-center">
          <div className="text-xs">{s.title}</div>
          <div className="font-bold text-xl">{s.value}</div>
        </Card>
      ))}
    </div>
  );
};

const AddressFilters = ({ filters, setFilters, territories }) => (
  <Card>
    <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
    <CardContent className="space-y-2">
      <div>
        <Label>Status</Label>
        <Select value={filters.status} onValueChange={v => setFilters(prev => ({...prev, status: v}))}>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="falta_pregar">Falta Pregar</SelectItem>
          <SelectItem value="pregado">Pregado</SelectItem>
        </Select>
      </div>
      <div>
        <Label>Território</Label>
        <Select value={filters.territory} onValueChange={v => setFilters(prev => ({...prev, territory: v}))}>
          <SelectItem value="all">Todos</SelectItem>
          {territories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </Select>
      </div>
    </CardContent>
  </Card>
);

const AddressCard = ({ address, onStatusChange, allTerritoriesComplete }) => {
  const statusConfig = {
    falta_pregar: { label:"Pendente", className:"bg-orange-100 text-orange-800", icon: Clock },
    pregado: { label:"Feito", className:"bg-green-100 text-green-800", icon: CheckCircle }
  };
  const cur = statusConfig[address.status];
  const StatusIcon = cur.icon;
  const enableButton = address.status==="falta_pregar" || allTerritoriesComplete;

  return (
    <Card>
      <div className="mb-2 font-bold">{address.address}</div>
      <div className="flex gap-2 mb-2">
        <Badge className={cur.className}>{cur.label}</Badge>
        <Badge>Visitas: {address.visit_count||0}</Badge>
      </div>
      {address.contact_name && <div>{address.contact_name}</div>}
      {address.phone && <div>{address.phone}</div>}
      <Button disabled={!enableButton} onClick={()=>onStatusChange(address,'pregado')}>Marcar como Feito</Button>
    </Card>
  );
};

// -------------------- PAGES --------------------
const EnderecosPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status:"all", territory:"all" });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async ()=>{
    setIsLoading(true);
    const user = await User.me();
    setCurrentUser(user);
    let data = user.role==="admin" ? await Address.list() : await Address.filter({assigned_to_email:user.email});
    setAddresses(data);
    setIsLoading(false);
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  useEffect(()=>{
    let f = [...addresses];
    if(filters.status!=="all") f=f.filter(a=>a.status===filters.status);
    if(filters.territory!=="all") f=f.filter(a=>a.territory===filters.territory);
    if(searchQuery) f=f.filter(a=>
      a.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.contact_name && a.contact_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredAddresses(f);
  },[addresses,filters,searchQuery]);

  const handleStatusChange = async (addr,newStatus)=>{
    const updateData = {...addr, status:newStatus};
    if(newStatus==="pregado") {
      updateData.last_visit_date = new Date().toISOString().split('T')[0];
      updateData.visit_count = (addr.visit_count||0)+1;
    }
    await Address.update(addr.id, updateData);
    loadData();
  };

  const territories = [...new Set(addresses.map(a=>a.territory))].filter(Boolean);
  const grouped = _.groupBy(filteredAddresses,'territory');
  const allComplete = Object.values(_.groupBy(addresses,'territory')).every(g=>g.every(a=>a.status==="pregado"));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1>Meus Endereços</h1>
        <Link to="/adicionar"><Button>Adicionar Endereço</Button></Link>
      </div>
      <AddressStats addresses={addresses} />
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <AddressFilters filters={filters} setFilters={setFilters} territories={territories} />
        <div className="md:col-span-3">
          <Input placeholder="Buscar..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
        </div>
      </div>
      <div className="space-y-4">
        {isLoading ? <div>Carregando...</div> :
          Object.entries(grouped).map(([t,addrs])=>(
            <div key={t}>
              <h2 className="font-bold">{t}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {addrs.map(a=><AddressCard key={a.id} address={a} onStatusChange={handleStatusChange} allTerritoriesComplete={allComplete}/>)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

const AdicionarPage = () => {
  const navigate = useNavigate();
  const [currentUser,setCurrentUser]=useState(null);
  const [usersList,setUsersList]=useState([]);
  const [form,setForm]=useState({
    address:"", territory:"", status:"falta_pregar", contact_name:"", phone:"", observations:"", best_time:"", last_visit_date:"", visit_count:0, assigned_to_email:""
  });
  useEffect(()=>{
    (async ()=>{
      const u = await User.me();
      setCurrentUser(u);
      setForm(prev=>({...prev,assigned_to_email:u.email}));
      if(u.role==="admin") setUsersList(await User.list());
    })();
  },[]);
  const handleChange = (f,v)=>setForm(prev=>({...prev,[f]:v}));
  const handleSubmit = async e=>{
    e.preventDefault();
    await Address.create(form);
    navigate("/");
  };
  return (
    <div className="p-4">
      <Button onClick={()=>navigate("/")}><ArrowLeft /> Voltar</Button>
      <h1 className="text-2xl font-bold my-2">Adicionar Endereço</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Label>Endereço</Label>
        <Input value={form.address} onChange={e=>handleChange("address",e.target.value)} required />
        <Label>Território</Label>
        <Input value={form.territory} onChange={e=>handleChange("territory",e.target.value)} required />
        {currentUser?.role==="admin" && (
          <>
            <Label>Atribuir a Usuário</Label>
            <Select value={form.assigned_to_email} onValueChange={v=>handleChange("assigned_to_email",v)}>
              {usersList.map(u=><SelectItem key={u.email} value={u.email}>{u.full_name} ({u.email})</SelectItem>)}
            </Select>
          </>
        )}
        <Label>Contato</Label>
        <Input value={form.contact_name} onChange={e=>handleChange("contact_name",e.target.value)} />
        <Label>Telefone</Label>
        <Input value={form.phone} onChange={e=>handleChange("phone",e.target.value)} />
        <Label>Status</Label>
        <Select value={form.status} onValueChange={v=>handleChange("status",v)}>
          <SelectItem value="falta_pregar">Falta Pregar</SelectItem>
          <SelectItem value="pregado">Pregado</SelectItem>
        </Select>
        <Label>Melhor Horário</Label>
        <Input value={form.best_time} onChange={e=>handleChange("best_time",e.target.value)} />
        {form.status==="pregado" && (
          <>
            <Label>Última Visita</Label>
            <Input type="date" value={form.last_visit_date} onChange={e=>handleChange("last_visit_date",e.target.value)} />
          </>
        )}
        <Label>Observações</Label>
        <Textarea value={form.observations} onChange={e=>handleChange("observations",e.target.value)} />
        <Button type="submit">Salvar Endereço</Button>
      </form>
    </div>
  );
};

// -------------------- APP --------------------
export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnderecosPage />} />
        <Route path="/adicionar" element={<AdicionarPage />} />
      </Routes>
    </BrowserRouter>
  );
}

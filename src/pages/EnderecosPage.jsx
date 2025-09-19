import React, { useState, useEffect } from "react";
import { Address } from "@/entities/Address";
import AddressCard from "@/components/AddressCard";
import AddressFilters from "@/components/AddressFilters";
import AddressStats from "@/components/AddressStats";

export default function EnderecosPage() {
  const [addresses, setAddresses] = useState([]);
  const [filters, setFilters] = useState({ status: "all", territory: "all" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const data = await Address.list();
        setAddresses(data);
      } catch (error) {
        console.error("Erro ao carregar endereços:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, []);

  const handleStatusChange = async (address, newStatus) => {
    try {
      await Address.update(address.id, { status: newStatus });
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === address.id ? { ...addr, status: newStatus } : addr
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Filtragem de endereços
  const filteredAddresses = addresses.filter((addr) => {
    const statusMatch =
      filters.status === "all" ? true : addr.status === filters.status;
    const territoryMatch =
      filters.territory === "all" ? true : addr.territory === filters.territory;
    return statusMatch && territoryMatch;
  });

  // Verifica se todos os endereços de todos os territórios estão pregados
  const allTerritoriesComplete =
    addresses.length > 0 &&
    addresses.every((addr) => addr.status === "pregado");

  // Obter lista única de territórios
  const territories = Array.from(new Set(addresses.map((addr) => addr.territory)));

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <AddressStats addresses={addresses} />

        <AddressFilters
          filters={filters}
          setFilters={setFilters}
          territories={territories}
        />

        {loading ? (
          <p className="text-center text-slate-500">Carregando endereços...</p>
        ) : filteredAddresses.length === 0 ? (
          <p className="text-center text-slate-500">Nenhum endereço encontrado.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onStatusChange={handleStatusChange}
                isAdmin={true} // Ajuste conforme necessidade de role
                allTerritoriesComplete={allTerritoriesComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

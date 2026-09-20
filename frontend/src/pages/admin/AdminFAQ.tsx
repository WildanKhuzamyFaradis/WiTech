import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Plus, Edit, Trash, X, HelpCircle, AlertCircle } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import type { FAQ } from "../../lib/types";

interface FaqForm {
  question: string;
  answer: string;
  sortOrder: number;
}

const emptyForm: FaqForm = {
  question: "",
  answer: "",
  sortOrder: 0,
};

export default function AdminFAQ() {
  const { faqs, addFaq, updateFaq, removeFaq, loading } = useAdminData();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    navigate("/admin/faq/new");
    return;
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.sortOrder ?? 0)) + 1 : 0;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setEditId(null);
    setFormError(null);
  };

  const openEdit = (f: FAQ) => {
    navigate(`/admin/faq/${f.id}/edit`);
    return;
    setForm({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder ?? 0,
    });
    setEditId(f.id);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Pertanyaan dan Jawaban harus diisi.");
      return;
    }
    if (submitting) return;

    try {
      setSubmitting(true);
      setFormError(null);
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        sortOrder: Math.max(0, Math.floor(form.sortOrder)),
      };

      const result = editId
        ? await updateFaq(editId, payload)
        : await addFaq(payload);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">FAQ</h1>
          <p className="text-base font-medium text-muted-foreground">{faqs.length} pertanyaan terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold hover:-translate-y-1 transition-transform neo-shadow-sm hover:neo-shadow-md"
        >
          <Plus size={18} strokeWidth={3} /> Tambah FAQ
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mb-6">
        <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari pertanyaan atau jawaban..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-transparent rounded-xl text-base font-bold text-foreground placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
        />
      </div>

      {/* Table */}
      <div className="neo-card bg-white rounded-3xl overflow-hidden neo-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border/10 bg-muted/50">
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Pertanyaan</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">Jawaban</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden sm:table-cell text-center">Urutan</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((faq) => (
                <tr key={faq.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-foreground text-sm max-w-xs">
                    <p className="font-black text-base text-foreground tracking-tight">{faq.question}</p>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-2 md:hidden mt-1">{faq.answer}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground hidden md:table-cell max-w-md">
                    <p className="line-clamp-2">{faq.answer}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden sm:table-cell text-center">
                    <span className="px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-black">
                      {faq.sortOrder ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(faq)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus pertanyaan "${faq.question}"?`)) {
                            const result = await removeFaq(faq.id);
                            if (!result.ok) alert(result.error);
                          }
                        }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Hapus"
                      >
                        <Trash size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <HelpCircle size={28} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">Belum ada FAQ.</p>
          </div>
        )}

        <div className="px-6 py-4 border-t-2 border-border/10 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Menampilkan {filtered.length} dari {faqs.length}
          </p>
        </div>
      </div>

    </div>
  );
}

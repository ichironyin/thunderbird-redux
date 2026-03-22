import { useState, useMemo, useCallback } from "react";
import {
  Mail,
  Send,
  Trash2,
  Inbox,
  PenSquare,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  LogOut,
  Reply,
  MailOpen,
  CheckCheck,
  Minus,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  email: string;
  unreadCount: number;
  isActive: boolean;
}

interface Email {
  id: string;
  subject: string;
  from_name: string;
  from_address: string;
  text: string;
  html?: string;
  date: string;
  isRead: boolean;
  isTrash: boolean;
  isTrash: boolean;
}

type Folder = "inbox" | "trash";

// ── Mock Data ──────────────────────────────────────────────────────────────

const INITIAL_ACCOUNTS: Account[] = [
  { id: "acc-1", email: "joao.silva@empresa.com", unreadCount: 3, isActive: true },
  { id: "acc-2", email: "maria@startup.io", unreadCount: 1, isActive: false },
];

const INITIAL_EMAILS: Record<string, Email[]> = {
  "acc-1": [
    {
      id: "e1",
      subject: "Reunião de alinhamento - Sprint 42",
      from_name: "Carlos Mendes",
      from_address: "carlos@empresa.com",
      text: "Olá João,\n\nGostaria de confirmar a reunião de alinhamento da Sprint 42, agendada para amanhã às 10h na sala de conferência principal.\n\nPauta:\n- Review dos entregáveis da sprint anterior\n- Planejamento de capacidade\n- Definição de prioridades para o próximo ciclo\n- Retrospectiva rápida\n\nPor favor, confirme sua presença.\n\nAbs,\nCarlos Mendes\nGerente de Projetos",
      date: "2025-03-22 09:15",
      isRead: false,
      isTrash: false,
    },
    {
      id: "e2",
      subject: "Deploy v3.8.1 aprovado para produção",
      from_name: "CI/CD Pipeline",
      from_address: "noreply@devops.empresa.com",
      text: "Build #4821 passou em todos os testes.\n\n✅ Unit tests: 342/342 passed\n✅ Integration tests: 89/89 passed\n✅ E2E tests: 24/24 passed\n✅ Security scan: No vulnerabilities found\n\nDeploy agendado para hoje às 18:00 UTC.\n\nAcompanhe em: https://pipeline.empresa.com/builds/4821",
      date: "2025-03-22 08:42",
      isRead: false,
      isTrash: false,
    },
    {
      id: "e3",
      subject: "Fatura #INV-20250322 - Serviços Cloud",
      from_name: "AWS Billing",
      from_address: "billing@aws.amazon.com",
      text: "Sua fatura referente ao período de Fevereiro/2025 está disponível. Valor total: R$ 4.287,93",
      html: `<div style="font-family: sans-serif; color: #d4d4d8; line-height: 1.7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png" alt="AWS Logo" style="height: 40px; margin-bottom: 12px;" />
        </div>
        <p>Prezado cliente,</p>
        <p>Sua fatura referente ao período de <strong>Fevereiro/2025</strong> está disponível.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 8px 0;">EC2 Instances</td><td style="text-align: right; padding: 8px 0;">R$ 1.890,00</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 8px 0;">RDS PostgreSQL</td><td style="text-align: right; padding: 8px 0;">R$ 980,50</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 8px 0;">S3 Storage</td><td style="text-align: right; padding: 8px 0;">R$ 412,33</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 8px 0;">CloudFront</td><td style="text-align: right; padding: 8px 0;">R$ 305,10</td></tr>
          <tr style="font-weight: bold;"><td style="padding: 8px 0;">Total</td><td style="text-align: right; padding: 8px 0; color: #60a5fa;">R$ 4.287,93</td></tr>
        </table>
        <p style="color: #71717a; font-size: 13px;">Vencimento: 05/04/2025</p>
      </div>`,
      date: "2025-03-21 14:30",
      isRead: true,
      isTrash: false,
    },
    {
      id: "e4",
      subject: "Re: Proposta de refatoração do módulo de auth",
      from_name: "Ana Beatriz",
      from_address: "ana.beatriz@empresa.com",
      text: "João,\n\nAnalisei sua proposta e concordo com a migração para OAuth2 + PKCE. Porém, sugiro que façamos em duas fases:\n\nFase 1: Migrar o fluxo de login web\nFase 2: Adaptar os clients mobile\n\nPodemos discutir os detalhes na daily de amanhã?\n\n-- Ana",
      date: "2025-03-21 11:05",
      isRead: false,
      isTrash: false,
    },
    {
      id: "e5",
      subject: "Newsletter Tech - Março 2025",
      from_name: "TechDigest",
      from_address: "news@techdigest.dev",
      text: "Esta semana em tecnologia: React 20, Rust enterprise, OpenSSL vulnerability",
      html: `<div style="font-family: sans-serif; color: #d4d4d8; line-height: 1.8;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #333; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #f4f4f5; font-size: 20px;">📡 TechDigest Weekly</h2>
          <p style="margin: 4px 0 0; color: #71717a; font-size: 13px;">Março 2025 • Edição #12</p>
        </div>
        <div style="margin-bottom: 20px;">
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=200&fit=crop" alt="Code on screen" style="width: 100%; border-radius: 8px; margin-bottom: 12px;" />
          <h3 style="color: #60a5fa; margin: 0 0 6px;">React 20 anunciado com compilador nativo</h3>
          <p style="margin: 0; font-size: 14px;">A equipe do React revelou a próxima versão major com compilação AOT integrada, prometendo ganhos de até 3x em performance inicial.</p>
        </div>
        <div style="margin-bottom: 20px;">
          <img src="https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=200&fit=crop" alt="Server room" style="width: 100%; border-radius: 8px; margin-bottom: 12px;" />
          <h3 style="color: #60a5fa; margin: 0 0 6px;">Rust ultrapassa Go em adoção enterprise</h3>
          <p style="margin: 0; font-size: 14px;">Pesquisa da Stack Overflow mostra Rust como a linguagem de sistemas mais adotada em novos projetos corporativos pela primeira vez.</p>
        </div>
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #333;">
          <p style="color: #71717a; font-size: 12px;">Você recebeu este email porque se inscreveu em techdigest.dev</p>
        </div>
      </div>`,
      date: "2025-03-20 07:00",
      isRead: true,
      isTrash: true,
    },
  ],
  "acc-2": [
    {
      id: "e6",
      subject: "Bem-vinda ao time! 🎉",
      from_name: "Pedro Costa",
      from_address: "pedro@startup.io",
      text: "Oi Maria!\n\nBem-vinda à startup.io! Estamos muito felizes em ter você no time.\n\nSeu onboarding começa segunda-feira. Enviaremos os acessos por email separado.\n\nQualquer dúvida, estou à disposição.\n\nAbraço,\nPedro",
      date: "2025-03-22 10:00",
      isRead: false,
      isTrash: false,
    },
    {
      id: "e7",
      subject: "Credenciais de acesso - Ambiente de Dev",
      from_name: "Infra Team",
      from_address: "infra@startup.io",
      text: "Maria,\n\nSeguem suas credenciais:\n- GitLab: maria@startup.io\n- Jira: maria.dev\n- Slack: convite enviado\n\nAltere sua senha no primeiro acesso.\n\n-- Infra Team",
      date: "2025-03-22 10:15",
      isRead: true,
      isTrash: false,
    },
  ],
};

// ── Sub-components ─────────────────────────────────────────────────────────

function FolderItem({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-colors ${
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-mail-hover-row hover:text-foreground"
      }`}
    >
      <Icon size={15} className="shrink-0" />
      <span className="flex-1 text-left truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-xs font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {count}
        </span>
      )}
    </button>
  );
}

function EmailRow({
  email,
  isSelected,
  isFocused,
  onSelect,
  onFocus,
}: {
  email: Email;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border-b border-border cursor-pointer transition-colors ${
        isFocused
          ? "bg-mail-selected-row"
          : "hover:bg-mail-hover-row"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        {isSelected ? (
          <CheckSquare size={16} className="text-primary" />
        ) : (
          <Square size={16} />
        )}
      </button>

      <div className="flex-1 min-w-0" onClick={onFocus}>
        <div className="flex items-center gap-2">
          {!email.isRead && (
            <span className="w-2 h-2 rounded-full bg-mail-unread-dot shrink-0" />
          )}
          <span
            className={`text-sm truncate ${
              !email.isRead ? "font-bold text-foreground" : "text-secondary-foreground"
            }`}
          >
            {email.from_name}
          </span>
          <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
            {email.date.slice(5, 16)}
          </span>
        </div>
        <p
          className={`text-sm truncate mt-0.5 ${
            !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
          }`}
        >
          {email.subject}
        </p>
      </div>
    </div>
  );
}

// ── Compose Modal ──────────────────────────────────────────────────────────

function ComposeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Nova Mensagem</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <input
            type="text"
            placeholder="Para:"
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Assunto:"
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <textarea
            rows={10}
            placeholder="Escreva sua mensagem..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none scrollbar-thin"
          />
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Index() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [allEmails, setAllEmails] = useState<Record<string, Email[]>>(INITIAL_EMAILS);
  const [currentFolder, setCurrentFolder] = useState<Folder>("inbox");
  const [focusedEmailId, setFocusedEmailId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const activeAccount = accounts.find((a) => a.isActive)!;
  const accountEmails = allEmails[activeAccount.id] || [];

  // Compute unread count dynamically
  const unreadCount = useMemo(
    () => accountEmails.filter((e) => !e.isRead && !e.isTrash).length,
    [accountEmails]
  );

  // Visible emails based on folder
  const visibleEmails = useMemo(() => {
    if (currentFolder === "inbox") return accountEmails.filter((e) => !e.isTrash);
    if (currentFolder === "trash") return accountEmails.filter((e) => e.isTrash);
    return [];
  }, [accountEmails, currentFolder]);

  const focusedEmail = visibleEmails.find((e) => e.id === focusedEmailId) || null;

  // ── Actions ────────────────────────────────────────────────────────────

  const switchAccount = useCallback((id: string) => {
    setAccounts((prev) =>
      prev.map((a) => ({ ...a, isActive: a.id === id }))
    );
    setFocusedEmailId(null);
    setSelectedIds(new Set());
    setCurrentFolder("inbox");
    setAccountMenuOpen(false);
  }, []);

  const removeAccount = useCallback((id: string) => {
    setAccounts((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isActive)) {
        remaining[0].isActive = true;
      }
      return remaining;
    });
  }, []);

  const updateEmails = useCallback(
    (updater: (emails: Email[]) => Email[]) => {
      setAllEmails((prev) => ({
        ...prev,
        [activeAccount.id]: updater(prev[activeAccount.id] || []),
      }));
    },
    [activeAccount.id]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = visibleEmails.map((e) => e.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }, [visibleEmails, selectedIds]);

  const moveToTrash = useCallback(
    (ids: string[]) => {
      updateEmails((emails) =>
        emails.map((e) => (ids.includes(e.id) ? { ...e, isTrash: true } : e))
      );
      setSelectedIds(new Set());
      if (focusedEmailId && ids.includes(focusedEmailId)) setFocusedEmailId(null);
    },
    [updateEmails, focusedEmailId]
  );

  const moveAllToTrash = useCallback(() => {
    moveToTrash(visibleEmails.map((e) => e.id));
  }, [moveToTrash, visibleEmails]);

  const moveSelectedToTrash = useCallback(() => {
    moveToTrash(Array.from(selectedIds));
  }, [moveToTrash, selectedIds]);

  const markAllRead = useCallback(() => {
    updateEmails((emails) =>
      emails.map((e) =>
        visibleEmails.some((v) => v.id === e.id) ? { ...e, isRead: true } : e
      )
    );
  }, [updateEmails, visibleEmails]);

  const markAsRead = useCallback(
    (id: string) => {
      updateEmails((emails) =>
        emails.map((e) => (e.id === id ? { ...e, isRead: true } : e))
      );
    },
    [updateEmails]
  );

  const handleFocusEmail = useCallback(
    (id: string) => {
      setFocusedEmailId(id);
      markAsRead(id);
    },
    [markAsRead]
  );

  const allVisibleSelected =
    visibleEmails.length > 0 && visibleEmails.every((e) => selectedIds.has(e.id));
  const someVisibleSelected = visibleEmails.some((e) => selectedIds.has(e.id));

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-sidebar">
        {/* Compose button */}
        <div className="p-3">
          <button
            onClick={() => setShowCompose(true)}
            className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground rounded px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PenSquare size={15} />
            Nova Mensagem
          </button>
        </div>

        {/* Account selector */}
        <div className="px-2 pb-2">
          <button
            onClick={() => setAccountMenuOpen((p) => !p)}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-sm bg-accent text-accent-foreground text-sm hover:opacity-90 transition-opacity"
          >
            <Mail size={14} className="shrink-0" />
            <span className="flex-1 text-left truncate text-xs font-medium">
              {activeAccount.email}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {accountMenuOpen && (
            <div className="mt-1 border border-border rounded bg-popover">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors ${
                    acc.isActive
                      ? "bg-mail-selected-row text-foreground"
                      : "text-muted-foreground hover:bg-mail-hover-row hover:text-foreground"
                  }`}
                >
                  <span
                    className="flex-1 truncate"
                    onClick={() => switchAccount(acc.id)}
                  >
                    {acc.email}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAccount(acc.id);
                    }}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    title="Deslogar esta conta"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Folders */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          <FolderItem
            icon={Inbox}
            label="Entrada"
            count={unreadCount}
            isActive={currentFolder === "inbox"}
            onClick={() => {
              setCurrentFolder("inbox");
              setFocusedEmailId(null);
              setSelectedIds(new Set());
            }}
          />
          <FolderItem
            icon={Trash2}
            label="Lixeira"
            isActive={currentFolder === "trash"}
            onClick={() => {
              setCurrentFolder("trash");
              setFocusedEmailId(null);
              setSelectedIds(new Set());
            }}
          />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          Thunderbird UI Clone
        </div>
      </aside>

      {/* ── Email List ──────────────────────────────────────────────── */}
      <section className="w-80 shrink-0 flex flex-col border-r border-border bg-card">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-mail-toolbar">
          <button
            onClick={selectAll}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Selecionar Todos"
          >
            {allVisibleSelected ? (
              <CheckSquare size={15} className="text-primary" />
            ) : someVisibleSelected ? (
              <Minus size={15} />
            ) : (
              <Square size={15} />
            )}
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={markAllRead}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Marcar todos como lidos"
          >
            <CheckCheck size={15} />
          </button>
          <button
            onClick={moveSelectedToTrash}
            disabled={selectedIds.size === 0}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Mover selecionados para lixeira"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={moveAllToTrash}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Mover todos para lixeira"
          >
            <Trash2 size={15} className="text-destructive" />
          </button>

          <span className="ml-auto text-xs text-muted-foreground">
            {visibleEmails.length} msgs
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {visibleEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <MailOpen size={32} />
              <span className="text-sm">Nenhum email nesta pasta</span>
            </div>
          ) : (
            visibleEmails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                isSelected={selectedIds.has(email.id)}
                isFocused={focusedEmailId === email.id}
                onSelect={() => toggleSelect(email.id)}
                onFocus={() => handleFocusEmail(email.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* ── Reading Pane ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {!focusedEmail ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Mail size={48} strokeWidth={1} />
            <p className="text-sm">Selecione um email para ler</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-border px-6 py-4 bg-mail-header">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-foreground truncate">
                    {focusedEmail.subject}
                  </h1>
                  <div className="mt-1 text-sm space-y-0.5">
                    <p className="text-secondary-foreground">
                      <span className="text-muted-foreground">De: </span>
                      {focusedEmail.from_name}{" "}
                      <span className="text-muted-foreground">
                        &lt;{focusedEmail.from_address}&gt;
                      </span>
                    </p>
                    <p className="text-secondary-foreground">
                      <span className="text-muted-foreground">Para: </span>
                      {activeAccount.email}
                    </p>
                    <p className="text-muted-foreground text-xs">{focusedEmail.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setShowCompose(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    <Reply size={13} />
                    Responder
                  </button>
                  <button
                    onClick={() => moveToTrash([focusedEmail.id])}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 size={13} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {focusedEmail.text}
              </pre>
            </div>
          </>
        )}
      </main>

      {/* Compose modal */}
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </div>
  );
}

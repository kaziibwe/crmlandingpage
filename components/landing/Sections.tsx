import { FAQ_ITEMS } from "@/lib/faq";

export function ProblemSolution() {
  return (
    <section id="platform" className="py-20 md:py-28 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="reveal max-w-2xl">
          <p className="eyebrow"><i className="fas fa-diagram-project"></i> Why EternityCRM</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Scattered conversations become one connected customer experience.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-12 items-stretch">
          <div className="reveal card p-7 md:p-9" data-delay="1">
            <span className="chip bg-rose-50 text-rose-600 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60 mb-5">
              <i className="fas fa-shuffle"></i> Without EternityCRM
            </span>
            <ul className="space-y-4 text-[15px]">
              <li className="flex items-center gap-3"><i className="fab fa-whatsapp text-slate-300 dark:text-slate-600"></i><span className="line-through decoration-rose-300/70 text-slate-400">WhatsApp chats on personal phones</span></li>
              <li className="flex items-center gap-3"><i className="fas fa-envelope text-slate-300 dark:text-slate-600"></i><span className="line-through decoration-rose-300/70 text-slate-400">Email threads in separate inboxes</span></li>
              <li className="flex items-center gap-3"><i className="fas fa-comment-dots text-slate-300 dark:text-slate-600"></i><span className="line-through decoration-rose-300/70 text-slate-400">SMS lost between team members</span></li>
              <li className="flex items-center gap-3"><i className="fas fa-phone text-slate-300 dark:text-slate-600"></i><span className="line-through decoration-rose-300/70 text-slate-400">Call notes on sticky notes</span></li>
              <li className="flex items-center gap-3"><i className="fas fa-table text-slate-300 dark:text-slate-600"></i><span className="line-through decoration-rose-300/70 text-slate-400">Spreadsheets nobody updates</span></li>
            </ul>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-6 leading-relaxed">Context lives in silos. Leads slip through. Nobody knows who spoke to whom — or what happens next.</p>
          </div>

          <div className="reveal card p-7 md:p-9 relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-white to-violet-50/70 dark:from-blue-950/30 dark:via-slate-950/60 dark:to-violet-950/30" data-delay="2">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl"></div>
            <span className="chip bg-blue-50 text-blue-600 border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70 mb-5">
              <i className="fas fa-infinity"></i> With EternityCRM
            </span>
            <ul className="space-y-4 text-[15px]">
              <li className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xs"></i></span><span className="text-slate-700 dark:text-slate-200">Every channel lands in one customer timeline</span></li>
              <li className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xs"></i></span><span className="text-slate-700 dark:text-slate-200">Deals move through a real pipeline — with AI Mode assisting</span></li>
              <li className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xs"></i></span><span className="text-slate-700 dark:text-slate-200">Campaigns reach leads on WhatsApp, email, SMS &amp; calls</span></li>
              <li className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xs"></i></span><span className="text-slate-700 dark:text-slate-200">Delivery tracked end-to-end, with automatic retries</span></li>
              <li className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xs"></i></span><span className="text-slate-700 dark:text-slate-200">Roles &amp; permissions keep data visible to the right people</span></li>
              <li className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xs"></i></span><span className="text-slate-700 dark:text-slate-200">Event guests get QR tickets — scanned at the door for verified entry</span></li>
            </ul>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">Your team always knows who spoke to the customer, when, and what happens next.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Channels() {
  return (
    <section id="channels" className="py-20 md:py-28 px-4 sm:px-6 bg-white dark:bg-slate-950/60 border-y border-slate-100 dark:border-slate-800/70 relative overflow-hidden">
      <div className="glow w-[460px] h-[460px] bg-blue-400/25 dark:bg-blue-600/20 -top-32 right-[-140px]"></div>
      <div className="max-w-7xl mx-auto relative">
        <div className="reveal max-w-2xl">
          <p className="eyebrow"><i className="fas fa-tower-broadcast"></i> Omnichannel communication</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">WhatsApp, email, SMS &amp; calls — unified.</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">One customer, every channel, full context. EternityCRM keeps the conversation history together no matter how the customer reaches you.</p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center mt-14">
          <div className="reveal">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="card card-hover p-4 sm:p-5 text-center">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto"><i className="fab fa-whatsapp text-emerald-500 text-lg"></i></span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-3">WhatsApp</p>
                <p className="text-[11px] text-slate-400 mt-1">Templated &amp; freeform messaging</p>
              </div>
              <div className="card card-hover p-4 sm:p-5 text-center">
                <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mx-auto"><i className="fas fa-envelope text-blue-500 text-lg"></i></span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-3">Email</p>
                <p className="text-[11px] text-slate-400 mt-1">Transactional email</p>
              </div>
              <div className="card card-hover p-4 sm:p-5 text-center">
                <span className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center mx-auto"><i className="fas fa-comment-dots text-cyan-500 text-lg"></i></span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-3">SMS</p>
                <p className="text-[11px] text-slate-400 mt-1">Templated &amp; freeform SMS</p>
              </div>
              <div className="card card-hover p-4 sm:p-5 text-center">
                <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mx-auto"><i className="fas fa-phone text-amber-500 text-lg"></i></span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-3">Voice calls</p>
                <p className="text-[11px] text-slate-400 mt-1">WebRTC quality metrics</p>
              </div>
            </div>
            <div className="hidden lg:flex justify-center py-3 text-blue-400/70"><i className="fas fa-arrow-down-long text-lg"></i></div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3 lg:mt-0">
              <div className="card p-4 flex items-center gap-3 bg-gradient-to-r from-blue-50/80 to-white dark:from-blue-950/40 dark:to-slate-950/60">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0"><i className="fas fa-inbox text-white text-sm"></i></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Unified customer timeline</p>
                  <p className="text-[11px] text-slate-400">Every message, call &amp; note in one thread</p>
                </div>
              </div>
              <div className="card p-4 flex items-center gap-3 bg-gradient-to-r from-white to-violet-50/80 dark:from-slate-950/60 dark:to-violet-950/40">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0"><i className="fas fa-heart-pulse text-white text-sm"></i></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Delivery &amp; quality tracking</p>
                  <p className="text-[11px] text-slate-400">Sent → delivered → read, with retries</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal" data-delay="1">
            <div className="mockup max-w-md mx-auto">
              <div className="mockup-bar !py-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">SN</span>
                <div className="ml-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sarah Nakato · Nakato Events</p>
                  <p className="text-[10px] text-slate-400">Deal: Corporate event package · Negotiation</p>
                </div>
                <span className="ml-auto chip !text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">Open deal</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0"><i className="fab fa-whatsapp text-emerald-600 dark:text-emerald-400 text-xs"></i></span>
                  <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[80%]">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Can you send the revised proposal today?</p>
                    <p className="text-[9px] text-slate-400 mt-1">WhatsApp · 09:14 · Delivered</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-blue-50 dark:bg-blue-950/50 rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[80%] border border-blue-100 dark:border-blue-900/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"><i className="fas fa-paperclip text-[9px] mr-1"></i>Proposal_v3.pdf — sent via campaign email</p>
                    <p className="text-[9px] text-slate-400 mt-1 text-right">Email · 10:02 · Opened</p>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/70 flex items-center justify-center shrink-0"><i className="fas fa-envelope text-blue-500 text-xs"></i></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-950/70 flex items-center justify-center shrink-0"><i className="fas fa-comment-dots text-cyan-500 text-xs"></i></span>
                  <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[80%]">
                    <p className="text-xs text-slate-600 dark:text-slate-300">Got it, reviewing now 👍</p>
                    <p className="text-[9px] text-slate-400 mt-1">SMS · 12:47 · Read</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-violet-200/70 dark:border-violet-900/60 bg-violet-50/60 dark:bg-violet-950/40 px-3.5 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <i className="fas fa-microchip text-violet-500 text-xs"></i>
                    <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">AI suggestion</p>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">Deal is in Negotiation with strong engagement. Suggest: follow-up call tomorrow 10am + task reminder.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AiSection() {
  return (
    <section id="ai" className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="glow w-[500px] h-[500px] bg-violet-400/25 dark:bg-violet-600/20 top-0 left-[-160px]"></div>
      <div className="max-w-7xl mx-auto relative">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="eyebrow justify-center"><i className="fas fa-microchip"></i> AI that works alongside your team</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Your AI copilot for leads, deals &amp; campaigns.</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">Not a buzzword — real agents in the product: a Lead Handler that works inbound leads, agents for contacts, campaigns &amp; analytics, and AI Mode on every lead and deal.</p>
        </div>

        <div className="reveal mt-14">
          <div className="grid md:grid-cols-5 gap-3">
            <div className="card card-hover p-5 text-center flow-line">
              <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto"><i className="fas fa-user-plus text-blue-500"></i></span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-3">Customer asks</p>
              <p className="text-[11px] text-slate-400 mt-1.5">Inbound message or call arrives</p>
            </div>
            <div className="card card-hover p-5 text-center flow-line">
              <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto"><i className="fas fa-brain text-violet-500"></i></span>
              <p className="text-sm font-semibold text-slate-810 dark:text-white mt-3">AI understands</p>
              <p className="text-[11px] text-slate-400 mt-1.5">Intent parsed via your chosen text &amp; voice models</p>
            </div>
            <div className="card card-hover p-5 text-center flow-line">
              <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto"><i className="fas fa-id-card text-cyan-500"></i></span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-3">CRM identifies</p>
              <p className="text-[11px] text-slate-400 mt-1.5">Customer identity matched &amp; duplicates reviewed</p>
            </div>
            <div className="card card-hover p-5 text-center flow-line">
              <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto"><i className="fas fa-robot text-emerald-500"></i></span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-3">AI responds</p>
              <p className="text-[11px] text-slate-400 mt-1.5">Drafts a reply grounded in your knowledge base</p>
            </div>
            <div className="card card-hover p-5 text-center">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto"><i className="fas fa-user-check text-white"></i></span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-3">Team takes over</p>
              <p className="text-[11px] text-slate-400 mt-1.5">Sales gets full context, human-in-the-loop</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <div className="reveal card card-hover p-6" data-delay="1">
            <span className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center"><i className="fas fa-user-astronaut text-violet-500"></i></span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">Lead Handler Agent</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">A built-in agent that engages new leads automatically — so inbound interest is answered the moment it arrives.</p>
          </div>
          <div className="reveal card card-hover p-6" data-delay="2">
            <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center"><i className="fas fa-wand-magic-sparkles text-blue-500"></i></span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">AI Mode on leads &amp; deals</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Switch any lead or opportunity into AI Mode, or set it workspace-wide. Configure text, voice, embedding, transcription &amp; speech models.</p>
          </div>
          <div className="reveal card card-hover p-6" data-delay="3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center"><i className="fas fa-chart-pie text-emerald-500"></i></span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">Analytics agent</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Pipeline health, conversion trends and churn insights surfaced in AI Analytics — with provider failover that keeps replies flowing.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pipeline() {
  return (
    <section id="pipeline" className="py-20 md:py-28 px-4 sm:px-6 bg-white dark:bg-slate-950/60 border-y border-slate-100 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto">
        <div className="reveal max-w-2xl">
          <p className="eyebrow"><i className="fas fa-filter-circle-dollar"></i> Sales pipeline</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Your team always knows what happens next.</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">Opportunities move through clear stages — with stage history, probability and close dates on every deal.</p>
        </div>

        <div className="reveal mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="stage-card card p-5 border-t-4 !border-t-blue-500">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Stage 1</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">Qualification</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">New leads captured from scraper, QR events &amp; AI</p>
          </div>
          <div className="stage-card card p-5 border-t-4 !border-t-cyan-500">
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Stage 2</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">Proposal / Quote</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Send proposals as email attachments or payment links</p>
          </div>
          <div className="stage-card card p-5 border-t-4 !border-t-amber-500">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Stage 3</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">Negotiation / Review</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Every call, message &amp; meeting logged on the deal</p>
          </div>
          <div className="stage-card card p-5 border-t-4 !border-t-emerald-500">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Stage 4</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">Closed Won</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Customer pays via a secure payment link</p>
          </div>
          <div className="stage-card card p-5 border-t-4 !border-t-slate-400 col-span-2 md:col-span-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 5</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">Closed Lost</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Lessons captured in notes — pipelines learn</p>
          </div>
        </div>

        <div className="reveal mt-8 grid sm:grid-cols-3 gap-4">
          <div className="card p-5 flex items-start gap-3.5">
            <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0"><i className="fas fa-code-branch text-blue-500"></i></span>
            <div><p className="text-sm font-semibold text-slate-800 dark:text-white">Stage history</p><p className="text-xs text-slate-400 mt-1">See who moved a deal and when</p></div>
          </div>
          <div className="card p-5 flex items-start gap-3.5">
            <span className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center shrink-0"><i className="fas fa-percent text-violet-500"></i></span>
            <div><p className="text-sm font-semibold text-slate-800 dark:text-white">Probability &amp; value</p><p className="text-xs text-slate-400 mt-1">Track deal value, close date &amp; win likelihood</p></div>
          </div>
          <div className="card p-5 flex items-start gap-3.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0"><i className="fas fa-calendar-check text-emerald-500"></i></span>
            <div><p className="text-sm font-semibold text-slate-800 dark:text-white">Meetings &amp; tasks</p><p className="text-xs text-slate-400 mt-1">Schedule follow-ups directly on the deal</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Customer360() {
  return (
    <section id="customer360" className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="reveal">
            <p className="eyebrow"><i className="fas fa-id-badge"></i> Customer 360</p>
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">The complete picture of every customer.</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">Contacts, accounts, opportunities, cases, tasks, meetings, notes and communications — linked to one identity, kept clean by Duplicate Review.</p>
            <ul className="mt-8 space-y-3.5">
              <li className="flex items-center gap-3 text-[15px] text-slate-700 dark:text-slate-200"><i className="fas fa-circle-check text-blue-500"></i> Unified identity across leads, contacts &amp; accounts</li>
              <li className="flex items-center gap-3 text-[15px] text-slate-700 dark:text-slate-200"><i className="fas fa-circle-check text-blue-500"></i> Cross-entity activity feed — notes on everything</li>
              <li className="flex items-center gap-3 text-[15px] text-slate-700 dark:text-slate-200"><i className="fas fa-circle-check text-blue-500"></i> Duplicate suggestions merged by a manager workbench</li>
              <li className="flex items-center gap-3 text-[15px] text-slate-700 dark:text-slate-200"><i className="fas fa-circle-check text-blue-500"></i> Import &amp; export your data whenever you need it</li>
            </ul>
          </div>

          <div className="reveal" data-delay="1">
            <div className="mockup max-w-md mx-auto lg:mx-0">
              <div className="mockup-bar !py-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">JM</span>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">James Mugisha</p>
                  <p className="text-[10px] text-slate-400">Mugisha Logistics · Account</p>
                </div>
                <span className="ml-auto chip !text-[9px] bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">Customer 360</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-center"><p className="text-[9px] text-slate-400">Open deal</p><p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">Proposal</p></div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-center"><p className="text-[9px] text-slate-400">Tasks</p><p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">3 open</p></div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-center"><p className="text-[9px] text-slate-400">Cases</p><p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">1 resolved</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                    <i className="fab fa-whatsapp text-emerald-500 text-sm w-5"></i>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 flex-1">"Confirmed delivery for Friday" <span className="text-slate-400">· 2d ago</span></p>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                    <i className="fas fa-phone text-amber-500 text-sm w-5"></i>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 flex-1">Call · 6 min · quality 4.5 MOS <span className="text-slate-400">· 3d ago</span></p>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                    <i className="fas fa-sticky-note text-amber-400 text-sm w-5"></i>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 flex-1">Note: prefers WhatsApp over email <span className="text-slate-400">? 5d ago</span></p>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                    <i className="fas fa-money-check-dollar text-emerald-500 text-sm w-5"></i>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 flex-1">Payment link opened <span className="text-slate-400">· 1h ago</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Automation() {
  return (
    <section id="automation" className="py-20 md:py-28 px-4 sm:px-6 bg-white dark:bg-slate-950/60 border-y border-slate-100 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="eyebrow justify-center"><i className="fas fa-gears"></i> Campaigns &amp; automation</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">From lead capture to follow-up — on autopilot.</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">Campaigns, lead lists and the Lead Handler agent work the queue while your team focuses on conversations.</p>
        </div>

        <div className="reveal mt-14 max-w-3xl mx-auto">
          <div className="space-y-0">
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center"><span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0"><i className="fas fa-spider text-orange-500"></i></span><span className="w-px h-8 bg-gradient-to-b from-blue-300 to-violet-300 dark:from-blue-800 dark:to-violet-800 mt-1"></span></div>
              <div className="pb-6"><p className="text-sm font-bold text-slate-800 dark:text-white">New leads are captured</p><p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Scraped from Google Maps &amp; LinkedIn, scanned from QR codes at events, or imported in bulk.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center"><span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0"><i className="fas fa-list-check text-blue-500"></i></span><span className="w-px h-8 bg-gradient-to-b from-blue-300 to-violet-300 dark:from-blue-800 dark:to-violet-800 mt-1"></span></div>
              <div className="pb-6"><p className="text-sm font-bold text-slate-800 dark:text-white">Leads are added to a list</p><p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Segmented into lead lists — ready for targeting.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center"><span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0"><i className="fas fa-bullhorn text-amber-500"></i></span><span className="w-px h-8 bg-gradient-to-b from-blue-300 to-violet-300 dark:from-blue-800 dark:to-violet-800 mt-1"></span></div>
              <div className="pb-6"><p className="text-sm font-bold text-slate-800 dark:text-white">A campaign goes out</p><p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">WhatsApp templates, email, SMS or call scripts — scheduled in batches and dispatched by workers.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center"><span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0"><i className="fas fa-envelope-circle-check text-cyan-500"></i></span><span className="w-px h-8 bg-gradient-to-b from-blue-300 to-violet-300 dark:from-blue-800 dark:to-violet-800 mt-1"></span></div>
              <div className="pb-6"><p className="text-sm font-bold text-slate-800 dark:text-white">Delivery is tracked &amp; retried</p><p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Accepted → sent → delivered → read. Failures auto-retry with one-click retry passes when needed.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center"><span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0"><i className="fas fa-bell text-white text-sm"></i></span></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white">Your team gets the warm lead</p><p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Replies land in the customer timeline — with AI suggestions ready.</p></div>
            </div>
          </div>
        </div>

        <div className="reveal mt-12 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-bolt text-amber-500"></i> Batch scheduling</span>
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-credit-card text-emerald-500"></i> Payment links</span>
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-qrcode text-rose-500"></i> QR event capture</span>
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-ticket text-fuchsia-500"></i> Event QR tickets</span>
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-barcode text-rose-400"></i> Door check-in scanner</span>
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-comments text-cyan-500"></i> Team chat</span>
          <span className="chip bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4"><i className="fas fa-calendar text-indigo-400"></i> Calendar</span>
        </div>
      </div>
    </section>
  );
}

export function Security() {
  return (
    <section id="security" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="eyebrow justify-center"><i className="fas fa-shield-halved"></i> Security &amp; trust</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Built for teams that take data seriously.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="reveal card card-hover p-6 text-center" data-delay="1">
            <span className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mx-auto"><i className="fas fa-user-shield text-blue-500 text-lg"></i></span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4">Role-based access</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Custom roles with granular permissions — dashboard, customers, campaigns, settings &amp; more.</p>
          </div>
          <div className="reveal card card-hover p-6 text-center" data-delay="2">
            <span className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center mx-auto"><i className="fas fa-key text-violet-500 text-lg"></i></span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4">Secure authentication</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Session-based auth with protected routes on every module.</p>
          </div>
          <div className="reveal card card-hover p-6 text-center" data-delay="3">
            <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto"><i className="fas fa-user-group text-emerald-500 text-lg"></i></span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4">Team permissions</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Owner visibility scoping and access delegations keep records seen by the right people.</p>
          </div>
          <div className="reveal card card-hover p-6 text-center">
            <span className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mx-auto"><i className="fas fa-clipboard-list text-amber-500 text-lg"></i></span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4">Auditability</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Stage history, decision logs in Duplicate Review and a cross-entity activity feed.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="reveal text-center">
          <p className="eyebrow justify-center"><i className="fas fa-circle-question"></i> FAQ</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Frequently asked questions.</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">Everything teams usually ask before switching to EternityCRM.</p>
        </div>
        {/* The list scrolls INSIDE the section: header stays, questions pan.
            Needed because FAQ is the last deck card — it would otherwise pin
            for only a moment before the page scrolls on. */}
        <div className="faq-scroll mt-10 space-y-3 max-h-[52vh] lg:max-h-[56vh] overflow-y-auto pr-1">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={item.q}
              className="reveal card group px-5 py-4 cursor-pointer"
              data-delay={String(Math.min(i + 1, 4))}
              open={i === 0}
            >
              <summary className="flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden">
                <span className="text-sm md:text-base font-bold text-slate-800 dark:text-white">{item.q}</span>
                <i className="fas fa-plus text-blue-500 text-xs shrink-0 transition-transform group-open:rotate-45"></i>
              </summary>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="reveal max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 px-6 py-16 md:py-20 text-center">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">Turn every customer conversation into an opportunity.</h2>
            <p className="text-blue-100 text-lg mt-4 max-w-xl mx-auto">Unify your channels, pipeline and AI in one workspace.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-9">
              <a href="#demo" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition">Get started</a>
              <a href="#demo" className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition">Book a demo</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * linkPrefix: set to "/" on standalone pages (e.g. /privacy) so the section
 * links navigate back to the landing page's anchors instead of dead hashes.
 */
export function Footer({ linkPrefix = "" }: { linkPrefix?: string } = {}) {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800/70 bg-white dark:bg-slate-950 pt-14 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <a href={`${linkPrefix}#top`} className="flex items-center gap-3">
              <img src="/logo.png" alt="EternityCRM logo" className="w-10 h-10 rounded-xl object-contain shadow-md ring-1 ring-slate-900/5 dark:ring-white/10" />
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Eternity<span className="text-blue-600 dark:text-blue-400">CRM</span></span>
            </a>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-4 max-w-sm leading-relaxed">One CRM for every customer conversation — leads, sales, campaigns, WhatsApp, email, SMS, calls and AI in a single workspace.</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500/80 dark:text-blue-400/70 mt-3"><i className="fas fa-infinity mr-1.5"></i>Believe in endless connections</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href={`${linkPrefix}#platform`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Platform</a></li>
              <li><a href={`${linkPrefix}#channels`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Channels</a></li>
              <li><a href={`${linkPrefix}#ai`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">AI</a></li>
              <li><a href={`${linkPrefix}#pipeline`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Sales pipeline</a></li>
              <li><a href={`${linkPrefix}#customer360`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Customer 360</a></li>
              <li><a href={`${linkPrefix}#automation`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Automation</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Get started</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href={`${linkPrefix}#demo`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Book a demo</a></li>
              <li><a href="https://crm.eternitycrm.com/login" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Sign in</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Contact</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="mailto:info@eternitycrm.com" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition break-all"><i className="fas fa-envelope mr-2 text-slate-400"></i>info@eternitycrm.com</a></li>
              <li><a href="mailto:alfredkaziibwe19@gmail.com" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition break-all"><i className="fas fa-at mr-2 text-slate-400"></i>alfredkaziibwe19@gmail.com</a></li>
              <li><a href="tel:+256785557587" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"><i className="fas fa-phone mr-2 text-slate-400"></i>+256 785 557 587</a></li>
              <li className="text-slate-400 dark:text-slate-500"><i className="fab fa-whatsapp mr-2 text-emerald-500"></i>WhatsApp &amp; calls welcome</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 EternityCRM. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy Policy</a>
            <a href="/terms" className="text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">Terms &amp; Conditions</a>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Built for teams that live in customer conversations.</p>
        </div>
      </div>
    </footer>
  );
}

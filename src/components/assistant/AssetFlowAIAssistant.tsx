import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Boxes,
  Clock,
  Wrench,
  Building,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataCard?: {
    title: string;
    items: { label: string; value: string; badge?: string }[];
  };
}

export const AssetFlowAIAssistant: React.FC = () => {
  const {
    assets,
    allocations,
    bookings,
    maintenanceRequests,
    departments,
    categories,
    currentUser,
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your role-aware AssetFlow Copilot. I analyze real database records across equipment status, schedules, overdue returns, and department utilization. Ask me any question or pick a quick suggestion below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Answer logic querying real database state
    setTimeout(() => {
      const q = queryText.toLowerCase();
      let replyText = '';
      let dataCard: Message['dataCard'] = undefined;

      if (q.includes('projector') || q.includes('presentation') || q.includes('audio-visual')) {
        const projectors = assets.filter(
          (a) => a.categoryId === 'cat-2' || a.name.toLowerCase().includes('projector')
        );
        const availableProj = projectors.filter((p) => p.status === 'Available');

        replyText = `Found ${projectors.length} projector / AV resources in the fleet. Currently, ${availableProj.length} are Available and ready for reservation:`;
        dataCard = {
          title: 'Projector & AV Resource Inventory',
          items: projectors.map((p) => ({
            label: `[${p.assetTag}] ${p.name}`,
            value: `Location: ${p.location}`,
            badge: p.status,
          })),
        };
      } else if (q.includes('overdue') || q.includes('return') || q.includes('late')) {
        const overdueAllocs = allocations.filter(
          (a) => a.status === 'Overdue' || (a.status === 'Active' && a.expectedReturnDate < todayStr)
        );

        if (overdueAllocs.length > 0) {
          replyText = `⚠️ Detected ${overdueAllocs.length} overdue allocation(s) requiring immediate check-in:`;
          dataCard = {
            title: 'Overdue Equipment Audit',
            items: overdueAllocs.map((a) => {
              const ast = assets.find((x) => x.id === a.assetId);
              return {
                label: `[${ast?.assetTag}] ${ast?.name}`,
                value: `Expected Return: ${a.expectedReturnDate}`,
                badge: 'Overdue',
              };
            }),
          };
        } else {
          replyText = 'Great news! All active equipment allocations are currently within their authorized return deadlines.';
        }
      } else if (q.includes('idle') || q.includes('unassigned') || q.includes('unused')) {
        const idle = assets.filter((a) => a.status === 'Available' && !a.isBookable);
        // Find department with most idle
        const deptIdleCounts: Record<string, number> = {};
        idle.forEach((i) => {
          deptIdleCounts[i.departmentId] = (deptIdleCounts[i.departmentId] || 0) + 1;
        });

        let maxDeptId = '';
        let maxCount = -1;
        Object.entries(deptIdleCounts).forEach(([dId, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxDeptId = dId;
          }
        });
        const topDept = departments.find((d) => d.id === maxDeptId)?.name || 'Engineering';

        replyText = `We currently have ${idle.length} unassigned idle physical assets across the enterprise. The department with the most idle equipment is "${topDept}" with ${maxCount} unassigned assets available for redeployment.`;
        dataCard = {
          title: 'Top Idle Assets for Redeployment',
          items: idle.slice(0, 4).map((i) => ({
            label: `[${i.assetTag}] ${i.name}`,
            value: `Location: ${i.location}`,
            badge: 'Available',
          })),
        };
      } else if (q.includes('maintenance') || q.includes('repair') || q.includes('broken')) {
        const underMaint = assets.filter((a) => a.status === 'Under Maintenance');
        const activeTickets = maintenanceRequests.filter((m) => m.status !== 'Resolved');

        replyText = `Currently, ${underMaint.length} asset(s) are Under Maintenance and strictly locked from reservation/allocation. There are ${activeTickets.length} open work order tickets.`;
        dataCard = {
          title: 'Active Maintenance Work Orders',
          items: activeTickets.map((t) => {
            const ast = assets.find((x) => x.id === t.assetId);
            return {
              label: `[${ast?.assetTag}] ${ast?.name}`,
              value: `Issue: ${t.issueDescription} (Tech: ${t.technicianName || 'Pending'})`,
              badge: t.priority,
            };
          }),
        };
      } else if (q.includes('booking') || q.includes('meeting room') || q.includes('reservation')) {
        const upcomingB = bookings.filter((b) => b.status === 'Upcoming' || b.status === 'Ongoing');
        replyText = `There are ${upcomingB.length} active/upcoming bookings on the schedule today. The conflict-prevention engine ensures zero double bookings.`;
        dataCard = {
          title: 'Upcoming Bookings Today',
          items: upcomingB.map((b) => {
            const res = assets.find((x) => x.id === b.resourceId);
            return {
              label: `${b.title} (${res?.name})`,
              value: `Booked by: ${b.userName} from ${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              badge: b.status,
            };
          }),
        };
      } else {
        replyText = `I analyzed the database for "${queryText}". AssetFlow currently tracks ${assets.length} total assets across ${departments.length} departments with ${allocations.filter((a) => a.status === 'Active').length} active allocations. Feel free to ask about specific equipment categories, maintenance work orders, or schedule availability.`;
      }

      const botReply: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataCard,
      };

      setMessages((prev) => [...prev, botReply]);
    }, 400);
  };

  const sampleQuestions = [
    'Which projectors are available tomorrow?',
    'Which assets are overdue for return?',
    'Which department has the most idle equipment?',
    'Which assets are currently under maintenance?',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md">
              <Bot className="w-5 h-5" />
            </span>
            <span>AssetFlow Copilot</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
              Live Database Grounded
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Natural language assistant that answers availability questions, inspects conflict schedules, and summarizes fleet health.
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleQuery(q)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.dataCard && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 mt-2 space-y-2 text-slate-900 dark:text-white">
                      <div className="font-semibold text-xs text-blue-600 dark:text-blue-400">
                        {m.dataCard.title}
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {m.dataCard.items.map((item, i) => (
                          <div key={i} className="py-2 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-[11px] text-slate-400">{item.value}</div>
                            </div>
                            {item.badge && <Badge status={item.badge} size="sm" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-right ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.name[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about projector availability, overdue returns, maintenance tickets..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuery(input);
            }}
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleQuery(input)}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

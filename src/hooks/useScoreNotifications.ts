import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { HealthScoreV2 } from "@/services/healthScoreService";

/**
 * Watches health score changes and creates notifications when:
 * - Score drops below 50 (critical)
 * - Score classification changes significantly
 * - Score drops by 10+ points
 */
export function useScoreNotifications(
  health: HealthScoreV2 | null,
  prevHealth: HealthScoreV2 | null,
  isLoading: boolean
) {
  const { user } = useAuth();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (isLoading || !health || !prevHealth || !user?.id || hasNotified.current) return;
    // Only fire once per session
    hasNotified.current = true;

    const score = health.score;
    const prevScore = prevHealth.score;
    const diff = score - prevScore;

    const notifications: Array<{
      user_id: string;
      title: string;
      message: string;
      type: string;
      category: string;
    }> = [];

    // Score dropped below 50
    if (score < 50 && prevScore >= 50) {
      notifications.push({
        user_id: user.id,
        title: "Score em zona crítica ⚠️",
        message: `Seu score caiu para ${score} pontos. Seu orçamento precisa de atenção.`,
        type: "alert",
        category: "bothub",
      });
    }

    // Big drop (10+ points)
    if (diff <= -10) {
      notifications.push({
        user_id: user.id,
        title: "Queda significativa no score 📉",
        message: `Seu score caiu ${Math.abs(diff)} pontos em relação ao mês anterior. Vale revisar seus gastos.`,
        type: "warning",
        category: "bothub",
      });
    }

    // Classification worsened
    const levelOrder = { verde: 2, amarelo: 1, vermelho: 0 } as const;
    if (
      levelOrder[health.level] < levelOrder[prevHealth.level] &&
      !notifications.some((n) => n.title.includes("zona crítica"))
    ) {
      const labels = { verde: "Saudável", amarelo: "Atenção", vermelho: "Crítico" } as const;
      notifications.push({
        user_id: user.id,
        title: `Score mudou para ${labels[health.level]}`,
        message: `Seu score passou de ${labels[prevHealth.level]} para ${labels[health.level]}. Confira os detalhes na Saúde Financeira.`,
        type: health.level === "vermelho" ? "alert" : "warning",
        category: "bothub",
      });
    }

    // Big improvement (celebrate!)
    if (diff >= 15) {
      notifications.push({
        user_id: user.id,
        title: "Score melhorou muito! 🚀",
        message: `Parabéns! Seu score subiu ${diff} pontos. Continue assim!`,
        type: "info",
        category: "bothub",
      });
    }

    if (notifications.length === 0) return;

    // Deduplicate: check if we already sent these today
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfToday = `${todayStr}T00:00:00`;

    supabase
      .from("notifications")
      .select("title")
      .eq("user_id", user.id)
      .eq("category", "bothub")
      .gte("created_at", startOfToday)
      .then(({ data: existing }) => {
        const existingTitles = new Set((existing ?? []).map((n) => n.title));
        const newNotifs = notifications.filter((n) => !existingTitles.has(n.title));
        if (newNotifs.length > 0) {
          supabase.from("notifications").insert(newNotifs as any).then(() => {
            window.dispatchEvent(new CustomEvent("notifications-updated"));
          });
        }
      });
  }, [health, prevHealth, isLoading, user?.id]);
}

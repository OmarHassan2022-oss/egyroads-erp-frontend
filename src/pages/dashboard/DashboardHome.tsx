import { useEffect, useRef } from "react";

export default function DashboardHome() {
  const cashflowRef = useRef<HTMLCanvasElement>(null);
  const costsRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadCharts = async () => {
      const Chart = (await import("chart.js/auto")).default;
      
      if (cashflowRef.current) {
        new Chart(cashflowRef.current.getContext("2d")!, {
          type: "line",
          data: {
            labels: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
            datasets: [
              {
                label: "مخطط",
                data: [5.2, 8.1, 11.4, 15.2, 20.1, 24.8, 29.3, 33.1, 37.4, 40.2, 44.1, 48.0],
                borderColor: "#3b82f6",
                borderWidth: 2,
                borderDash: [5, 4],
                tension: 0.4,
                pointRadius: 3,
                fill: false,
              },
              {
                label: "فعلي",
                data: [4.8, 7.6, 11.0, 15.8, 21.3, 25.9, 30.1, 33.8, 38.2, 41.0, 47.2, null],
                borderColor: "#f5a623",
                backgroundColor: "rgba(245,166,35,0.08)",
                borderWidth: 2.5,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#f5a623",
                fill: true,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false, rtl: true } },
            scales: {
              x: { ticks: { color: "#8a95aa", font: { size: 11 } }, grid: { color: "rgba(42,52,72,0.5)" } },
              y: { ticks: { color: "#8a95aa", font: { size: 11 }, callback: (v) => v + "M" }, grid: { color: "rgba(42,52,72,0.5)" } }
            }
          }
        });
      }

      if (costsRef.current) {
        new Chart(costsRef.current.getContext("2d")!, {
          type: "bar",
          data: {
            labels: ["محور الضبعة","طريق العاشر","كوبري العبور","بنية تحتية","الدائري"],
            datasets: [
              { label: "مخطط", data: [12.4, 7.2, 8.8, 5.1, 3.4], backgroundColor: "rgba(59,130,246,0.6)", borderRadius: 4 },
              { label: "فعلي",  data: [13.1, 7.8, 9.6, 4.9, 3.1], backgroundColor: "rgba(245,166,35,0.7)", borderRadius: 4 },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { rtl: true } },
            scales: {
              x: { ticks: { color: "#8a95aa", font: { size: 11 } }, grid: { display: false } },
              y: { ticks: { color: "#8a95aa", font: { size: 11 }, callback: (v) => v + "M" }, grid: { color: "rgba(42,52,72,0.4)" } }
            }
          }
        });
      }

      if (donutRef.current) {
        new Chart(donutRef.current.getContext("2d")!, {
          type: "doughnut",
          data: {
            labels: ["مواد","عمالة","معدات","مقاولو باطن","عامة"],
            datasets: [{
              data: [38, 24, 21, 11, 6],
              backgroundColor: ["#3b82f6","#22c55e","#f5a623","#a855f7","#8a95aa"],
              borderWidth: 0,
              borderRadius: 3,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: { legend: { display: false } }
          }
        });
      }
    };

    loadCharts();
  }, []);

  const projects = [
    { name: "محور الضبعة", progress: 78, planned: 75 },
    { name: "طريق العاشر", progress: 52, planned: 60 },
    { name: "كوبري العبور", progress: 34, planned: 45 },
    { name: "مشروع البنية التحتية", progress: 91, planned: 88 },
    { name: "طريق الدائري الإقليمي", progress: 19, planned: 22 },
  ];

  const extracts = [
    { project: "محور الضبعة", num: "IPC-14", value: "8.4M", status: "مراجعة", class: "pill-amber" },
    { project: "طريق العاشر", num: "IPC-07", value: "3.2M", status: "معتمد", class: "pill-green" },
    { project: "كوبري العبور", num: "IPC-03", value: "5.7M", status: "اعتماد نهائي", class: "pill-blue" },
    { project: "بنية تحتية", num: "IPC-11", value: "2.1M", status: "مراجعة", class: "pill-amber" },
    { project: "الدائري الإقليمي", num: "IPC-02", value: "1.8M", status: "رفض — مراجعة", class: "pill-red" },
  ];

  const alerts = [
    { icon: "🚨", title: "شذوذ في نقلة أسفلت", meta: "لوحة: أ.ب.ج 1234 — تأخر 47 دقيقة • محور الضبعة • منذ 12 د" },
    { icon: "⚡", title: "تجاوز ميزانية — كوبري العبور", meta: "تجاوز 8.2% من الميزانية المعتمدة • منذ 1 س" },
    { icon: "📋", title: "استحقاق ضمان بنكي قادم", meta: "ضمان حسن التنفيذ — يستحق خلال 7 أيام • طريق العاشر" },
    { icon: "🤖", title: "تعارض كميات — تسليم ميداني", meta: "الكمية المستخرجة تتجاوز البند العقدي بـ 12% • منذ 2 س" },
    { icon: "👷", title: "نقص عمالة — موقع الضبعة", meta: "حضور 68% فقط من القوى المطلوبة • اليوم" },
  ];

  return (
    <div>
      <div className="ai-banner">
        <div className="ai-banner-left">
          <div className="ai-pulse"></div>
          <div>
            <div className="ai-banner-text">الذكاء الاصطناعي يعمل — تحليل 7 نقلات + 3 تسليمات ميدانية</div>
            <div className="ai-banner-meta">آخر تحديث: منذ 4 دقائق — تم اكتشاف شذوذ في نقلة 1 من مشروع محور الضبعة</div>
          </div>
        </div>
        <div className="ai-banner-right">عرض التفاصيل ←</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-icon">💰</div>
          <div className="kpi-label">إجمالي المستخلصات</div>
          <div className="kpi-value" style={{ color: "var(--green)" }}>47.2M</div>
          <div className="kpi-delta up">▲ 12.3% عن الشهر الماضي</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">🏗️</div>
          <div className="kpi-label">مشاريع نشطة</div>
          <div className="kpi-value" style={{ color: "var(--blue)" }}>8</div>
          <div className="kpi-delta up">▲ مشروعان جديدان هذا الشهر</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">📈</div>
          <div className="kpi-label">متوسط الإنجاز</div>
          <div className="kpi-value" style={{ color: "var(--accent)" }}>63%</div>
          <div className="kpi-delta down">▼ 2.1% عن الخطة</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-label">تجاوزات تكلفة</div>
          <div className="kpi-value" style={{ color: "var(--red)" }}>2</div>
          <div className="kpi-delta down">مشروعان يتجاوزان الميزانية</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon">🚚</div>
          <div className="kpi-label">نقلات اليوم</div>
          <div className="kpi-value" style={{ color: "var(--purple)" }}>142</div>
          <div className="kpi-delta up">▲ 7 شذوذات مكتشفة</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">التدفق النقدي — خطة vs فعلي</div>
              <div className="card-subtitle">المبالغ بالمليون جنيه — 2024</div>
            </div>
            <span className="badge badge-amber">CPI: 0.94</span>
          </div>
          <div style={{ position: "relative", height: "220px" }}>
            <canvas id="cashflowChart" ref={cashflowRef}></canvas>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">نسب إنجاز المشاريع</div>
              <div className="card-subtitle">مقارنة بالخطة الزمنية</div>
            </div>
          </div>
          <div className="progress-list">
            {projects.map((p) => (
              <div key={p.name} className="progress-item">
                <div className="progress-header">
                  <span className="progress-name">{p.name}</span>
                  <span className="progress-pct" style={{ color: p.progress >= p.planned ? "var(--green)" : "var(--accent)" }}>{p.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.progress >= p.planned ? "var(--green)" : "var(--accent)" }}></div>
                </div>
                <div className="progress-meta">
                  خطة: {p.planned}% • {p.progress >= p.planned ? "تقدم" : "تأخر"}: {Math.abs(p.progress - p.planned)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">آخر المستخلصات</div>
              <div className="card-subtitle">قيد الاعتماد والصرف</div>
            </div>
            <span className="badge badge-amber">4 قيد المراجعة</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>المشروع</th>
                <th>رقم</th>
                <th>القيمة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {extracts.map((e) => (
                <tr key={e.num}>
                  <td>{e.project}</td>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{e.num}</td>
                  <td style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>{e.value}</td>
                  <td><span className={`status-pill ${e.class}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">التنبيهات الحرجة</div>
              <div className="card-subtitle">تحديث فوري</div>
            </div>
            <span className="badge badge-red">10 تنبيه</span>
          </div>
          <div className="alert-feed">
            {alerts.map((a, i) => (
              <div key={i} className="alert-item">
                <span className="alert-icon">{a.icon}</span>
                <div className="alert-text">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-meta">{a.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="chart-card">
            <div className="card-header">
              <div className="card-title">المعدات — ملخص</div>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">إجمالي المعدات</span>
              <span className="mini-stat-value">47</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">تشغيل فعلي</span>
              <span className="mini-stat-value" style={{ color: "var(--green)" }}>38</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">صيانة / متوقف</span>
              <span className="mini-stat-value" style={{ color: "var(--red)" }}>9</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">معدل الاستخدام</span>
              <span className="mini-stat-value" style={{ color: "var(--accent)" }}>81%</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">تكلفة تشغيل اليوم</span>
              <span className="mini-stat-value">142,800 جنيه</span>
            </div>
          </div>

          <div className="chart-card">
            <div className="card-header">
              <div className="card-title">الموارد البشرية</div>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">إجمالي الموظفين</span>
              <span className="mini-stat-value">284</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">حضور اليوم</span>
              <span className="mini-stat-value" style={{ color: "var(--green)" }}>251</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">غائبون</span>
              <span className="mini-stat-value" style={{ color: "var(--red)" }}>33</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">إجمالي الرواتب (شهري)</span>
              <span className="mini-stat-value">2.84M جنيه</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">تحليل التكاليف — مقارنة مخطط vs فعلي</div>
              <div className="card-subtitle">جميع المشاريع — الشهر الحالي (بالمليون جنيه)</div>
            </div>
          </div>
          <div style={{ position: "relative", height: "220px" }}>
            <canvas id="costsChart" ref={costsRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">توزيع التكاليف</div>
              <div className="card-subtitle">الشهر الحالي</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative", height: "160px", width: "160px", flexShrink: 0 }}>
              <canvas id="donutChart" ref={donutRef}></canvas>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#3b82f6", display: "inline-block" }}></span>
                مواد خام — 38%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#22c55e", display: "inline-block" }}></span>
                عمالة — 24%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f5a623", display: "inline-block" }}></span>
                معدات — 21%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#a855f7", display: "inline-block" }}></span>
                مقاولو باطن — 11%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#8a95aa", display: "inline-block" }}></span>
                مصاريف عامة — 6%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
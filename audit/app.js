/* Relatório interativo da auditoria. Lê window.AUDIT (data.js) e desenha cada seção conforme o hash da URL. */
(function () {
  'use strict';
  var D = window.AUDIT;
  var main = document.getElementById('main');
  var nav = document.getElementById('nav');

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // Inline `code` in data strings becomes <code>.
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function num(n) { return String(n).replace('.', ','); }
  function band(n) { return n >= 7 ? 'good' : n >= 5 ? 'warning' : 'critical'; }
  function bandLabel(n) { return n >= 7 ? 'bom' : n >= 5 ? 'atenção' : 'crítico'; }
  function avg(o) { var k = Object.keys(o), t = 0; k.forEach(function (x) { t += o[x]; }); return Math.round((t / k.length) * 10) / 10; }
  var SEV = { 'crítico': 'critical', 'alto': 'serious', 'médio': 'warning', 'baixo': 'neutral' };
  var PRI = { P0: 'critical', P1: 'serious', P2: 'warning', P3: 'neutral' };
  var IMP = { ESSENCIAL: 'accent', IMPORTANTE: 'good', COMPLEMENTAR: 'neutral', 'QUESTIONÁVEL': 'warning', 'DESNECESSÁRIA': 'critical' };
  var STATE = { 'Completa': 'good', 'Parcialmente implementada': 'warning', 'Apenas visual': 'serious', 'Não funcional': 'critical', 'Com problemas identificados': 'serious' };
  function pill(text, cls) { return '<span class="pill ' + (cls || '') + '"><span class="dot"></span>' + esc(text) + '</span>'; }
  function list(items, cls) {
    if (!items || !items.length) return '<p class="faint">Nada identificado.</p>';
    return '<ul class="' + (cls || '') + '">' + items.map(function (i) { return '<li>' + rich(i) + '</li>'; }).join('') + '</ul>';
  }
  function scoreRow(name, v) {
    return '<div class="score-row"><span class="name" title="' + esc(name) + '">' + esc(name) + '</span>' +
      '<div class="bar ' + band(v) + '" role="img" aria-label="' + esc(name) + ': ' + num(v) + ' de 10"><i style="width:' + v * 10 + '%"></i></div>' +
      '<span class="val">' + num(v) + '</span></div>';
  }
  function issueById(id) { return D.issues.filter(function (i) { return i.id === id; })[0]; }
  function issueLinks(ids) {
    if (!ids || !ids.length) return '<p class="faint">Nenhum problema associado.</p>';
    return '<div class="pills">' + ids.map(function (id) {
      var i = issueById(id);
      return '<a class="pill ' + SEV[i.severity] + '" href="#problemas" data-open="' + id + '" style="text-decoration:none"><span class="dot"></span>' + id + ' · ' + esc(i.title) + '</a>';
    }).join('') + '</div>';
  }

  // ---------- views ----------
  var VIEWS = [
    { id: 'visao', label: 'Visão geral', render: viewOverview },
    { id: 'scorecard', label: 'Scorecard', count: function () { return D.scores.length; }, render: viewScorecard },
    { id: 'telas', label: 'Telas', count: function () { return D.screens.length; }, render: viewScreens },
    { id: 'features', label: 'Features', count: function () { return D.features.length; }, render: viewFeatures },
    { id: 'problemas', label: 'Problemas', count: function () { return D.issues.length; }, render: viewIssues },
    { id: 'arquitetura', label: 'Arquitetura', render: viewArch },
    { id: 'fluxos', label: 'Fluxos', count: function () { return D.flows.length; }, render: viewFlows },
    { id: 'lacunas', label: 'Features ausentes', count: function () { return D.missing.length; }, render: viewMissing },
    { id: 'mercado', label: 'Benchmark', render: viewMarket },
    { id: 'roadmap', label: 'Roadmap', count: function () { return D.counts.tasks; }, render: viewRoadmap }
  ];

  function head(crumb, title, text) {
    return '<header class="view-head"><span class="crumb">' + esc(crumb) + '</span><h1>' + esc(title) + '</h1>' + (text ? '<p>' + rich(text) + '</p>' : '') + '</header>';
  }

  function viewOverview() {
    var o = D.overall, c = D.counts;
    var crit = D.issues.filter(function (i) { return i.severity === 'crítico' || i.severity === 'alto'; });
    var circ = 2 * Math.PI * 46;
    var ring = '<svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Nota geral ' + num(o.score) + ' de 10">' +
      '<circle class="track" cx="60" cy="60" r="46"/>' +
      '<circle class="fill" cx="60" cy="60" r="46" stroke-dasharray="' + (circ * o.score / 10).toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
      '<text class="big" x="60" y="62" text-anchor="middle" dominant-baseline="middle">' + num(o.score) + '</text>' +
      '<text class="small" x="60" y="86" text-anchor="middle">de 10</text></svg>';
    var steps = o.maturityScale.map(function (s) {
      var idx = o.maturityScale.indexOf(o.maturity), i = o.maturityScale.indexOf(s);
      return '<div class="step ' + (i < idx ? 'done' : i === idx ? 'now' : '') + '"><i></i>' + esc(s) + '</div>';
    }).join('');
    return head('Treina · commit ' + D.meta.commit + ' · ' + D.meta.date, 'Visão geral', null) +
      '<div class="banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><p>' + esc(D.meta.phase) + '</p></div>' +
      '<div class="grid g-kpi">' +
      kpi('Nota geral', num(o.score) + '<small> /10</small>', 'Produção; ' + num(o.frontPhaseScore) + ' para a fase de front') +
      kpi('Maturidade', esc(o.maturity), 'Escala de 6 níveis') +
      kpi('Telas analisadas', c.screens, '+ ' + c.dialogs + ' diálogos') +
      kpi('Features', c.features, 'Inventário completo') +
      kpi('Problemas', c.issues, crit.length + ' críticos ou altos · ' + c.hypotheses + ' hipóteses') +
      kpi('Melhorias', c.tasks, 'Tarefas no roadmap · ' + c.missing + ' features ausentes') +
      '</div>' +
      '<div class="grid g-hero">' +
      '<section class="card"><div class="card-head"><h2>Nota e maturidade</h2><span class="faint">média simples dos 10 indicadores</span></div>' +
      '<div class="ring-score">' + ring + '<div class="block"><p>' + esc(o.maturityWhy) + '</p></div></div>' +
      '<h4>Maturidade</h4><div class="stepper" role="img" aria-label="Maturidade: ' + esc(o.maturity) + '">' + steps + '</div></section>' +
      '<section class="card"><div class="card-head"><h2>Indicadores</h2><a href="#scorecard">Detalhes</a></div>' + radar() + '</section>' +
      '</div>' +
      '<div class="grid g-2">' +
      '<section class="card"><div class="card-head"><h2>Problemas mais graves</h2><a href="#problemas">Todos</a></div><div class="stack-list">' +
      crit.map(function (i) {
        return '<a href="#problemas" data-open="' + i.id + '" style="text-decoration:none;color:inherit;display:flex;gap:10px;align-items:flex-start">' + pill(i.severity, SEV[i.severity]) + '<span><b>' + esc(i.title) + '</b><br><span class="faint">' + i.id + ' · ' + esc(i.area) + '</span></span></a>';
      }).join('') + '</div></section>' +
      '<section class="card"><div class="card-head"><h2>Verificações executadas</h2></div><div class="stack-list">' +
      D.meta.checks.map(function (ch) {
        var cls = ch.result === 'Passa' ? 'good' : ch.result === 'Inexistentes' || ch.result === 'Inexistente' ? 'critical' : 'warning';
        return '<div><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>' + esc(ch.name) + '</b>' + pill(ch.result, cls) + '</div><p class="faint">' + rich(ch.detail) + '</p></div>';
      }).join('') +
      '<h4>Não verificado</h4>' + list(D.meta.notVerified) + '</div></section>' +
      '</div>' +
      '<section class="card"><div class="card-head"><h2>Notas por tela</h2><a href="#telas">Abrir telas</a></div>' + screensHeat() + '</section>';
  }
  function kpi(label, value, sub) {
    return '<div class="card kpi"><span class="label">' + esc(label) + '</span><span class="value">' + value + '</span><span class="sub">' + esc(sub) + '</span></div>';
  }

  function radar() {
    var s = D.scores, n = s.length, cx = 220, cy = 175, R = 120;
    function pt(i, v) { var a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * R * v / 10, cy + Math.sin(a) * R * v / 10]; }
    var rings = [2, 4, 6, 8, 10].map(function (v) {
      return '<polygon class="ring" points="' + s.map(function (_, i) { return pt(i, v).join(','); }).join(' ') + '"/>';
    }).join('');
    var ticks = [2, 4, 6, 8, 10].map(function (v) { var p = pt(0, v); return '<text class="tick" x="' + (p[0] + 4) + '" y="' + (p[1] + 3) + '">' + v + '</text>'; }).join('');
    var axes = s.map(function (_, i) { var p = pt(i, 10); return '<line class="axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; }).join('');
    var area = '<polygon class="area" points="' + s.map(function (x, i) { return pt(i, x.score).join(','); }).join(' ') + '"/>';
    var labels = s.map(function (x, i) {
      var p = pt(i, 11.6), anchor = Math.abs(p[0] - cx) < 8 ? 'middle' : p[0] > cx ? 'start' : 'end';
      return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(x.label) + '</text>';
    }).join('');
    var pts = s.map(function (x, i) {
      var p = pt(i, x.score);
      return '<circle class="pt" cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>' +
        '<circle class="hit" cx="' + p[0] + '" cy="' + p[1] + '" r="14" tabindex="0" data-tip="' + esc(x.label + ': ' + num(x.score) + ' de 10') + '"><title>' + esc(x.label + ': ' + num(x.score)) + '</title></circle>';
    }).join('');
    return '<div class="radar-wrap"><svg class="radar" viewBox="0 0 440 350" role="img" aria-label="Gráfico radar com as 10 notas do scorecard">' + rings + axes + ticks + area + labels + pts + '</svg><div class="tooltip" hidden></div></div>' +
      '<div class="stack-list">' + s.map(function (x) { return scoreRow(x.label, x.score); }).join('') + '</div>';
  }

  function screensHeat() {
    var rows = D.screens.map(function (s) {
      var a = avg(s.scores);
      return '<tr class="clickable" data-go="tela-' + s.id + '"><td><b>' + esc(s.name) + '</b><br><span class="faint mono">' + esc(s.route) + '</span></td>' +
        ['tech', 'ux', 'complete', 'maturity'].map(function (k) { return '<td><span class="heat ' + band(s.scores[k]) + '">' + s.scores[k] + '</span></td>'; }).join('') +
        '<td class="n"><b>' + num(a) + '</b></td></tr>';
    }).join('');
    return '<div class="table-wrap"><table><thead><tr><th>Tela</th><th>Técnica</th><th>UX/UI</th><th>Completude</th><th>Maturidade</th><th>Média</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="faint">Cores: verde 7 ou mais, amarelo 5 a 6, vermelho abaixo de 5. Toque em uma linha para abrir a tela.</p>';
  }

  function viewScorecard() {
    return head('Seção 8', 'Scorecard do produto', 'Notas de 0 a 10. Segurança, escalabilidade e prontidão medem a distância até a produção; na fase de front-first, notas baixas nesses itens são esperadas.') +
      '<div class="grid g-2">' + D.scores.map(function (s) {
        return '<section class="card"><div class="card-head"><h2>' + esc(s.label) + '</h2><span>' + pill(num(s.score) + ' · ' + bandLabel(s.score), band(s.score)) + '</span></div>' +
          '<div class="bar ' + band(s.score) + '"><i style="width:' + s.score * 10 + '%"></i></div>' +
          '<p>' + rich(s.why) + '</p><div class="detail-grid"><div class="block"><h4>Principais problemas</h4>' + list(s.problems, 'list-minus') + '</div>' +
          '<div class="block"><h4>Como melhorar</h4>' + list(s.improve, 'list-plus') + '</div></div></section>';
      }).join('') + '</div>' +
      '<section class="card"><h2>Por que ' + esc(D.overall.maturity) + '</h2><p>' + esc(D.overall.maturityWhy) + '</p><p class="faint">' + esc(D.overall.frontPhaseWhy) + '</p></section>';
  }

  var screenFilter = 'Todas';
  function viewScreens() {
    var groups = ['Todas'].concat(D.screens.map(function (s) { return s.group; }).filter(function (g, i, a) { return a.indexOf(g) === i; }));
    var items = D.screens.filter(function (s) { return screenFilter === 'Todas' || s.group === screenFilter; });
    return head('Seção 2', 'Telas', D.screens.length + ' telas e 5 diálogos analisados. Abra uma tela para ver funcionalidades, UX, técnica, oportunidades, notas e arquivos.') +
      '<div class="toolbar"><div class="seg" role="group" aria-label="Filtrar por grupo">' + groups.map(function (g) {
        return '<button type="button" data-sf="' + esc(g) + '" aria-pressed="' + (g === screenFilter) + '">' + esc(g) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="grid g-3">' + items.map(function (s) {
        var a = avg(s.scores);
        return '<button type="button" class="card screen-card" data-go="tela-' + s.id + '">' +
          '<div class="card-head"><h3>' + esc(s.name) + '</h3><span class="avg ' + '">' + num(a) + '</span></div>' +
          '<span class="route">' + esc(s.route) + '</span><p class="muted">' + esc(s.objective) + '</p>' +
          '<div class="minibars">' + mini('Técnica', s.scores.tech) + mini('UX/UI', s.scores.ux) + mini('Compl.', s.scores.complete) + mini('Matur.', s.scores.maturity) + '</div>' +
          '<div class="pills">' + pill(s.group, 'outline') + pill('Importância ' + s.importance.toLowerCase(), s.importance === 'Alta' ? 'accent' : 'neutral') +
          (s.issues.length ? pill(s.issues.length + (s.issues.length === 1 ? ' problema' : ' problemas'), 'serious') : '') + '</div></button>';
      }).join('') + '</div>';
  }
  function mini(label, v) {
    return '<div class="minibar"><div class="top"><span>' + label + '</span><b>' + v + '</b></div><div class="bar ' + band(v) + '"><i style="width:' + v * 10 + '%"></i></div></div>';
  }

  function viewScreen(id) {
    var s = D.screens.filter(function (x) { return x.id === id; })[0];
    if (!s) return viewScreens();
    var labels = { tech: 'Qualidade técnica', ux: 'UX/UI', complete: 'Completude funcional', maturity: 'Maturidade' };
    var plus = s.ux.filter(function (u) { return u.indexOf('+ ') === 0; }).map(function (u) { return u.slice(2); });
    var minus = s.ux.filter(function (u) { return u.indexOf('- ') === 0; }).map(function (u) { return u.slice(2); });
    var st = s.states;
    return '<button type="button" class="back" data-go="telas">← Todas as telas</button>' +
      head(s.group + ' · ' + s.route, s.name, s.objective) +
      '<div class="card detail-panel">' +
      '<div class="detail-grid"><div class="block"><h4>Identificação</h4><p><b>Contexto:</b> ' + esc(s.context) + '</p><p><b>Importância no fluxo principal:</b> ' + esc(s.importance) + '</p></div>' +
      '<div class="block"><h4>Evidências (arquivos)</h4><div class="files">' + s.files.map(function (f) { return '<code>' + esc(f) + '</code>'; }).join('') + '</div></div></div>' +
      '<div class="just">' + Object.keys(labels).map(function (k) {
        return '<div class="j"><div class="top"><span>' + labels[k] + '</span><b>' + s.scores[k] + '</b></div><div class="bar ' + band(s.scores[k]) + '"><i style="width:' + s.scores[k] * 10 + '%"></i></div><p class="faint">' + esc(s.justify[k]) + '</p></div>';
      }).join('') + '</div></div>' +
      '<div class="grid g-2">' +
      '<section class="card"><h2>Funcionalidades</h2><div class="block"><h4>Funciona</h4>' + list(s.works, 'list-plus') + '</div>' +
      '<div class="block"><h4>Parcial</h4>' + list(s.partial) + '</div>' +
      '<div class="block"><h4>Apenas visual ou demonstrativo</h4>' + list(s.visual) + '</div>' +
      '<div class="block"><h4>Redundâncias e simplificações</h4>' + list(s.redundant) + '</div></section>' +
      '<section class="card"><h2>UX/UI</h2><div class="block"><h4>Pontos positivos</h4>' + list(plus, 'list-plus') + '</div>' +
      '<div class="block"><h4>Pontos negativos</h4>' + list(minus, 'list-minus') + '</div>' +
      '<div class="block"><h4>Estados da tela</h4><div class="states"><div><b>Carregando</b>' + esc(st.loading) + '</div><div><b>Vazio</b>' + esc(st.empty) + '</div><div><b>Erro</b>' + esc(st.error) + '</div><div><b>Sucesso</b>' + esc(st.success) + '</div></div></div></section>' +
      '<section class="card"><h2>Avaliação técnica</h2>' + list(s.tech) + '</section>' +
      '<section class="card"><h2>Oportunidades</h2>' + list(s.opportunities, 'list-plus') + '<h4>Problemas relacionados</h4>' + issueLinks(s.issues) + '</section>' +
      '</div>';
  }

  var featFilter = 'Todas';
  var openFeat = null;
  function viewFeatures() {
    var imps = ['Todas', 'ESSENCIAL', 'IMPORTANTE', 'COMPLEMENTAR', 'QUESTIONÁVEL'];
    var byImp = {}; D.features.forEach(function (f) { byImp[f.importance] = (byImp[f.importance] || 0) + 1; });
    var byState = {}; D.features.forEach(function (f) { byState[f.state] = (byState[f.state] || 0) + 1; });
    var items = D.features.filter(function (f) { return featFilter === 'Todas' || f.importance === featFilter; });
    var rows = items.map(function (f) {
      var r = '<tr class="clickable" data-feat="' + f.id + '" aria-expanded="' + (openFeat === f.id) + '"><td class="n">' + f.id + '</td><td><b>' + esc(f.name) + '</b></td><td>' + pill(f.importance, IMP[f.importance]) + '</td><td>' + pill(f.state, STATE[f.state]) + '</td>' +
        '<td style="min-width:120px"><div class="score-row" style="grid-template-columns:minmax(0,1fr) 28px"><div class="bar ' + band(f.quality) + '"><i style="width:' + f.quality * 10 + '%"></i></div><span class="val">' + f.quality + '</span></div></td><td>' + pill(f.priority, PRI[f.priority]) + '</td></tr>';
      if (openFeat === f.id) {
        r += '<tr class="detail"><td></td><td colspan="5"><div class="detail-grid">' +
          '<div class="block"><p><b>Problema que resolve:</b> ' + esc(f.problem) + '</p><p><b>Faz sentido para o produto:</b> ' + esc(f.fit) + '</p><p><b>Implementação:</b> ' + esc(f.implementation) + '</p></div>' +
          '<div class="block"><p><b>Intuitiva:</b> ' + esc(f.intuitive) + '</p><p><b>Etapa faltando:</b> ' + esc(f.missingStep) + '</p><p><b>Impacto da ausência:</b> ' + esc(f.absence) + '</p></div></div>' +
          (f.screens.length ? '<p style="margin-top:8px"><b>Telas:</b> ' + f.screens.map(function (id) { var s = D.screens.filter(function (x) { return x.id === id; })[0]; return '<a href="#tela-' + id + '">' + esc(s.name) + '</a>'; }).join(', ') + '</p>' : '') +
          '<div style="margin-top:8px">' + issueLinks(f.issues) + '</div></td></tr>';
      }
      return r;
    }).join('');
    function dist(obj, map) {
      var total = D.features.length;
      return '<div class="stack-list">' + Object.keys(obj).map(function (k) {
        return '<div class="score-row" style="grid-template-columns:minmax(0,190px) minmax(0,1fr) 28px"><span class="name">' + pill(k, map[k]) + '</span><div class="bar"><i style="width:' + (obj[k] / total * 100) + '%;background:var(--accent)"></i></div><span class="val">' + obj[k] + '</span></div>';
      }).join('') + '</div>';
    }
    return head('Seção 3', 'Features', 'Inventário de ' + D.features.length + ' funcionalidades com importância para a proposta, estado real da implementação, qualidade (0 a 10) e prioridade de melhoria. Toque em uma linha para ver a análise.') +
      '<div class="grid g-2"><section class="card"><h2>Por importância</h2>' + dist(byImp, IMP) + '</section><section class="card"><h2>Por estado</h2>' + dist(byState, STATE) + '</section></div>' +
      '<div class="toolbar"><div class="seg" role="group" aria-label="Filtrar por importância">' + imps.map(function (g) {
        return '<button type="button" data-ff="' + g + '" aria-pressed="' + (g === featFilter) + '">' + (g === 'Todas' ? 'Todas' : g.charAt(0) + g.slice(1).toLowerCase()) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="table-wrap"><table><thead><tr><th>ID</th><th>Feature</th><th>Importância</th><th>Estado</th><th>Qualidade</th><th>Prioridade</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  var issueSev = 'Todas', openIssue = null, issueQuery = '';
  function viewIssues() {
    var sevs = ['Todas', 'crítico', 'alto', 'médio', 'baixo'];
    var order = { 'crítico': 0, 'alto': 1, 'médio': 2, 'baixo': 3 };
    var counts = {}; D.issues.forEach(function (i) { counts[i.severity] = (counts[i.severity] || 0) + 1; });
    var q = issueQuery.toLowerCase();
    var items = D.issues.filter(function (i) {
      return (issueSev === 'Todas' || i.severity === issueSev) && (!q || (i.title + i.detail + i.evidence + i.area).toLowerCase().indexOf(q) >= 0);
    }).sort(function (a, b) { return order[a.severity] - order[b.severity] || a.id.localeCompare(b.id); });
    return head('Seção 5', 'Problemas comprovados', 'Cada item foi confirmado no código, com o arquivo como evidência. Hipóteses ficam separadas no fim. A severidade considera a fase de front-first.') +
      '<div class="grid g-kpi">' + sevs.slice(1).map(function (s) { return kpi('Severidade ' + s, counts[s] || 0, s === 'crítico' ? 'bloqueia uso real' : s === 'alto' ? 'corrigir na próxima fase' : s === 'médio' ? 'atrito ou risco' : 'limpeza'); }).join('') +
      kpi('Hipóteses', D.hypotheses.length, 'não comprovadas') + kpi('Total', D.issues.length, 'problemas comprovados') + '</div>' +
      '<div class="toolbar"><div class="seg" role="group" aria-label="Filtrar por severidade">' + sevs.map(function (g) {
        return '<button type="button" data-is="' + g + '" aria-pressed="' + (g === issueSev) + '">' + (g === 'Todas' ? 'Todas' : g.charAt(0).toUpperCase() + g.slice(1)) + '</button>';
      }).join('') + '</div><label class="faint" for="issue-q">Buscar</label><input id="issue-q" class="search" type="search" placeholder="arquivo, área ou termo" value="' + esc(issueQuery) + '"></div>' +
      '<div class="stack-list">' + (items.length ? items.map(function (i) {
        return '<details class="issue" id="issue-' + i.id + '"' + (openIssue === i.id ? ' open' : '') + '><summary><span class="id">' + i.id + '</span><span class="t">' + esc(i.title) + '<br><span class="faint">' + esc(i.area) + ' · ' + esc(i.kind) + '</span></span>' + pill(i.severity, SEV[i.severity]) + '</summary>' +
          '<div class="body"><p>' + rich(i.detail) + '</p><p><b>Evidência:</b> ' + rich(i.evidence) + '</p><p><b>Correção sugerida:</b> ' + rich(i.fix) + '</p></div></details>';
      }).join('') : '<p class="faint">Nenhum problema com esse filtro.</p>') + '</div>' +
      '<section class="card"><h2>Hipóteses e pontos não verificados</h2>' + list(D.hypotheses.map(function (h) { return h.id + ' · ' + h.title + ': ' + h.detail; })) + '</section>';
  }

  function viewArch() {
    var A = D.architecture;
    var nest = '';
    A.providers.slice().reverse().forEach(function (p) {
      var deps = A.providerDeps.filter(function (d) { return d.from === p; });
      nest = '<div class="p">' + esc(p) + (deps.length ? '<span class="dep">depende de ' + deps.map(function (d) { return esc(d.to) + ' (' + esc(d.why) + ')'; }).join('; ') + '</span>' : '') + nest + '</div>';
    });
    var domRows = A.domains.map(function (d) {
      return '<tr><td><b>' + esc(d.name) + '</b></td><td><code>' + esc(d.context) + '</code></td><td><code>' + esc(d.lib) + '</code></td><td>' + d.screens.map(function (s) { return '<code>' + esc(s) + '</code>'; }).join(' ') + '</td></tr>';
    }).join('');
    return head('Seção 5', 'Arquitetura', 'Estrutura identificada no código: camadas, estado global, domínios e integrações. A recomendação central é criar a camada de repositório antes de continuar adicionando telas.') +
      '<section class="card"><div class="card-head"><h2>Camadas e dependências</h2><span class="faint">setas tracejadas: quem usa quem</span></div><div class="arch"><div class="layer-stack">' +
      A.layers.map(function (l, i) {
        var cls = i === 0 ? 'l-routes' : l.name.indexOf('Contextos') === 0 ? 'l-ctx' : '';
        return '<div class="layer ' + cls + '"><span class="ln">' + esc(l.name) + '</span><span class="lf">' + l.files + ' arquivos</span><span class="lr">' + esc(l.role) + '</span></div>';
      }).join('') + '</div><div class="ext"><h4>Serviços externos</h4>' + A.external.map(function (e) { return '<div class="e"><b>' + esc(e.name) + '</b><code>' + esc(e.used) + '</code></div>'; }).join('') + '</div></div>' +
      '<p class="faint">A camada de contextos (em amarelo) concentra estado de tela, regras e armazenamento ao mesmo tempo; é o ponto que a integração com o backend vai tocar.</p></section>' +
      '<div class="grid g-2"><section class="card"><h2>Providers em _layout.tsx</h2><p class="faint">De fora para dentro. Todos ficam acima do controle de sessão.</p><div class="nest">' + nest + '</div></section>' +
      '<section class="card"><h2>Stack</h2>' + D.stack.map(function (g) { return '<div class="block"><h4>' + esc(g.group) + '</h4>' + list(g.items) + '</div>'; }).join('') + '</section></div>' +
      '<section class="card"><h2>Domínios</h2><div class="table-wrap"><table><thead><tr><th>Domínio</th><th>Contexto</th><th>Lib</th><th>Telas</th></tr></thead><tbody>' + domRows + '</tbody></table></div></section>' +
      '<section class="card"><h2>Integrações</h2><div class="table-wrap"><table><thead><tr><th>Serviço</th><th>Onde</th><th>Observação</th></tr></thead><tbody>' +
      A.external.map(function (e) { return '<tr><td><b>' + esc(e.name) + '</b></td><td><code>' + esc(e.used) + '</code></td><td>' + esc(e.note) + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
      '<div class="pc"><section class="card"><h2>Pontos positivos</h2>' + list(A.pros, 'list-plus') + '</section><section class="card"><h2>Pontos negativos</h2>' + list(A.cons, 'list-minus') + '</section></div>' +
      '<section class="card"><h2>Arquitetura recomendada para a integração</h2><div class="chain" role="img" aria-label="Telas chamam hooks, hooks chamam repositórios, repositórios têm implementação local agora e HTTP depois">' +
      ['Telas e componentes', 'Hooks de domínio', 'Interfaces de repositório', 'Implementação local (agora)', 'Implementação HTTP (fase 5)'].map(function (t, i) {
        return '<div class="node ' + (i === 4 ? 'missing' : 'ok') + '" style="flex-basis:180px"><div class="box"><span class="d"></span>' + esc(t) + '</div></div>';
      }).join('') + '</div><p class="muted">As telas continuam falando com os mesmos hooks; só a implementação do repositório muda. Os tipos de <code>src/lib</code> viram o contrato inicial da API, e os dados de exemplo passam a ser fixtures ativadas apenas em modo demo.</p></section>';
  }

  function viewFlows() {
    var legend = '<div class="legend"><span><i style="background:var(--good)"></i>Funciona</span><span><i style="background:var(--warning)"></i>Fricção</span><span><i style="background:var(--critical)"></i>Quebra</span><span><i style="border:1.5px dashed var(--ink-3)"></i>Etapa inexistente</span></div>';
    return head('Seção 6', 'Fluxos de usuário', 'Etapas mapeadas a partir das rotas e das ações das telas. Notas sob cada etapa explicam a fricção ou a quebra.') + legend +
      D.flows.map(function (f) {
        var counts = { friction: 0, break: 0, missing: 0 };
        f.steps.forEach(function (s) { if (counts[s.kind] != null) counts[s.kind]++; });
        return '<section class="card flow"><div class="card-head"><h2>' + esc(f.name) + '</h2><div class="pills">' +
          (counts.break ? pill(counts.break + ' quebra' + (counts.break > 1 ? 's' : ''), 'critical') : '') +
          (counts.friction ? pill(counts.friction + ' fricç' + (counts.friction > 1 ? 'ões' : 'ão'), 'warning') : '') +
          (counts.missing ? pill(counts.missing + ' inexistente' + (counts.missing > 1 ? 's' : ''), 'outline') : '') + '</div></div>' +
          '<div class="chain">' + f.steps.map(function (s) {
            return '<div class="node ' + s.kind + '"><div class="box"><span class="d"></span><span>' + esc(s.label) + '</span></div>' + (s.note ? '<span class="note">' + esc(s.note) + '</span>' : '') + '</div>';
          }).join('') + '</div><p class="muted">' + esc(f.notes) + '</p></section>';
      }).join('');
  }

  function viewMissing() {
    var desc = { P0: 'Bloqueia o lançamento ou o uso essencial', P1: 'Antes ou logo após o lançamento', P2: 'Evolução relevante', P3: 'Futuro ou diferencial' };
    return head('Seção 4', 'Features ausentes', 'Avaliado como se o produto fosse lançado comercialmente. Cada item traz a justificativa ligada à proposta do Treina.') +
      '<div class="kanban">' + ['P0', 'P1', 'P2', 'P3'].map(function (p) {
        var items = D.missing.filter(function (m) { return m.priority === p; });
        return '<div class="col"><div class="col-head">' + pill(p, PRI[p]) + '<span class="faint">' + items.length + '</span></div><p class="faint">' + desc[p] + '</p>' +
          items.map(function (m) { return '<div class="mini"><span class="area">' + esc(m.area) + '</span><b>' + esc(m.name) + '</b><p>' + esc(m.why) + '</p></div>'; }).join('') + '</div>';
      }).join('') + '</div>';
  }

  function viewMarket() {
    var B = D.benchmark;
    return head('Seção 7', 'Benchmark', null) +
      '<div class="banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><p>' + esc(B.caveat) + '</p></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Referência</th><th>Segmento</th><th>Pontos fortes</th><th>Treina hoje</th><th>Oportunidade</th></tr></thead><tbody>' +
      B.competitors.map(function (c) { return '<tr><td><b>' + esc(c.name) + '</b></td><td>' + esc(c.segment) + '</td><td>' + esc(c.strengths) + '</td><td>' + esc(c.treinaVs) + '</td><td>' + esc(c.opportunity) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<div class="pc"><section class="card"><h2>Diferenciais a reforçar</h2>' + list(B.differentiators, 'list-plus') + '</section><section class="card"><h2>O que não copiar</h2>' + list(B.doNotCopy, 'list-minus') + '</section></div>';
  }

  var roadPri = 'Todas';
  function viewRoadmap() {
    var all = []; D.roadmap.forEach(function (ph) { ph.tasks.forEach(function (t) { all.push(t); }); });
    var lvl = { 'Baixa': 1, 'Média': 2, 'Alta': 3, 'Baixo': 1, 'Médio': 2, 'Alto': 3 };
    function meter(label, v) { var n = lvl[v]; return '<span class="meter">' + label + ' <i class="' + (n >= 1 ? 'on' : '') + '"></i><i class="' + (n >= 2 ? 'on' : '') + '"></i><i class="' + (n >= 3 ? 'on' : '') + '"></i> ' + esc(v) + '</span>'; }
    // Matrix: rows = impact (high top), cols = complexity (low left).
    var cells = '';
    ['Alto', 'Médio', 'Baixo'].forEach(function (imp, r) {
      cells += '<div class="ax">Impacto ' + imp.toLowerCase() + '</div>';
      ['Baixa', 'Média', 'Alta'].forEach(function (cx) {
        var ts = all.filter(function (t) { return t.impact === imp && t.complexity === cx; });
        cells += '<div class="cell ' + (imp === 'Alto' && cx !== 'Alta' ? 'sweet' : '') + '">' + ts.map(function (t) { return '<span class="chip-id ' + t.priority + '" title="' + esc(t.title) + '">' + t.id + '</span>'; }).join('') + '</div>';
      });
    });
    cells += '<div></div><div class="ax">Complexidade baixa</div><div class="ax">média</div><div class="ax">alta</div>';
    var pris = ['Todas', 'P0', 'P1', 'P2', 'P3'];
    return head('Seção 9', 'Roadmap de evolução', 'Cinco fases ordenadas por impacto, dependências e esforço. As fases 1 a 4 não dependem do backend; a fase 5 é a integração e o lançamento.') +
      '<div class="grid g-2"><section class="card"><div class="card-head"><h2>Impacto × complexidade</h2><span class="faint">verde: maior retorno por esforço</span></div><div class="matrix">' + cells + '</div><p class="faint">Borda vermelha: P0 · laranja: P1.</p></section>' +
      '<section class="card"><h2>Cinco ações mais importantes</h2><ol style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px">' +
      ['<b>R-03 + R-04</b> · Camada de repositório e persistência local. Destrava testes reais e a integração.',
       '<b>R-01 + R-02</b> · Isolar dados por conta e tirar dados fictícios do estado do usuário.',
       '<b>R-08</b> · Metas calculadas do perfil, cumprindo a promessa do cadastro.',
       '<b>R-09 + R-12</b> · Edição de registros e histórico de treinos.',
       '<b>R-07</b> · Testes de domínio e CI antes do OTA.'].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></section></div>' +
      '<div class="toolbar"><div class="seg" role="group" aria-label="Filtrar por prioridade">' + pris.map(function (p) {
        return '<button type="button" data-rp="' + p + '" aria-pressed="' + (p === roadPri) + '">' + p + '</button>';
      }).join('') + '</div></div>' +
      '<div class="timeline">' + D.roadmap.map(function (ph) {
        var ts = ph.tasks.filter(function (t) { return roadPri === 'Todas' || t.priority === roadPri; });
        return '<div class="phase"><div class="phase-label"><b>Fase ' + ph.phase + '</b><span>' + esc(ph.name) + '</span><span>' + esc(ph.goal) + '</span></div><div class="tasks">' +
          (ts.length ? ts.map(function (t) {
            return '<div class="task"><span class="tid">' + t.id + '</span><div><div class="tt">' + esc(t.title) + '</div><div class="tp">' + rich(t.problem) + '</div></div>' +
              '<div class="tm">' + pill(t.priority, PRI[t.priority]) + meter('Impacto', t.impact) + meter('Esforço', t.complexity) + '</div>' +
              '<details><summary>Dependências e critério de conclusão</summary><p><b>Depende de:</b> ' + esc(t.deps) + '</p><p><b>Concluído quando:</b> ' + esc(t.done) + '</p></details></div>';
          }).join('') : '<p class="faint">Nenhuma tarefa com essa prioridade nesta fase.</p>') + '</div></div>';
      }).join('') + '</div>';
  }

  // ---------- routing ----------
  function current() { var h = (location.hash || '').slice(1); return h || 'visao'; }
  function renderNav(active) {
    var base = active.indexOf('tela-') === 0 ? 'telas' : active;
    nav.innerHTML = VIEWS.map(function (v) {
      return '<a href="#' + v.id + '"' + (v.id === base ? ' aria-current="page"' : '') + '><span>' + esc(v.label) + '</span>' + (v.count ? '<span class="count">' + v.count() + '</span>' : '') + '</a>';
    }).join('');
  }
  function render(keepScroll) {
    var id = current();
    renderNav(id);
    var html;
    if (id.indexOf('tela-') === 0) html = viewScreen(id.slice(5));
    else { var v = VIEWS.filter(function (x) { return x.id === id; })[0] || VIEWS[0]; html = v.render(); }
    main.innerHTML = '<div class="view">' + html + '</div>';
    if (!keepScroll) window.scrollTo(0, 0);
    bindRadar();
  }
  window.addEventListener('hashchange', function () { render(false); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-sf],[data-ff],[data-feat],[data-is],[data-rp],[data-open]');
    if (!t) return;
    if (t.hasAttribute('data-open')) { openIssue = t.getAttribute('data-open'); issueSev = 'Todas'; issueQuery = ''; if (location.hash === '#problemas') { e.preventDefault(); render(true); scrollToIssue(); } else setTimeout(scrollToIssue, 60); return; }
    if (t.hasAttribute('data-go')) { location.hash = t.getAttribute('data-go'); return; }
    if (t.hasAttribute('data-sf')) { screenFilter = t.getAttribute('data-sf'); render(true); }
    if (t.hasAttribute('data-ff')) { featFilter = t.getAttribute('data-ff'); openFeat = null; render(true); }
    if (t.hasAttribute('data-feat')) { var f = t.getAttribute('data-feat'); openFeat = openFeat === f ? null : f; render(true); }
    if (t.hasAttribute('data-is')) { issueSev = t.getAttribute('data-is'); render(true); }
    if (t.hasAttribute('data-rp')) { roadPri = t.getAttribute('data-rp'); render(true); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('tr[data-go],tr[data-feat]')) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'issue-q') {
      issueQuery = e.target.value; var pos = e.target.selectionStart; render(true);
      var el = document.getElementById('issue-q'); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (_) {} }
    }
  });
  function scrollToIssue() { var el = document.getElementById('issue-' + openIssue); if (el) { el.open = true; el.scrollIntoView({ block: 'center' }); } }

  function bindRadar() {
    var wrap = document.querySelector('.radar-wrap'); if (!wrap) return;
    var tip = wrap.querySelector('.tooltip');
    function show(el) {
      var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      tip.textContent = el.getAttribute('data-tip'); tip.hidden = false;
      tip.style.left = (r.left + r.width / 2 - w.left) + 'px'; tip.style.top = (r.top - w.top) + 'px';
    }
    wrap.querySelectorAll('.hit').forEach(function (h) {
      h.addEventListener('mouseenter', function () { show(h); }); h.addEventListener('focus', function () { show(h); });
      h.addEventListener('mouseleave', function () { tip.hidden = true; }); h.addEventListener('blur', function () { tip.hidden = true; });
    });
  }

  document.getElementById('meta-line').textContent = 'commit ' + D.meta.commit + ' · ' + D.meta.branchAnalyzed;
  document.getElementById('foot-date').textContent = 'Gerado em ' + D.meta.date.split('-').reverse().join('/');
  // Make clickable table rows reachable by keyboard.
  new MutationObserver(function () {
    main.querySelectorAll('tr[data-go],tr[data-feat]').forEach(function (tr) { if (!tr.hasAttribute('tabindex')) { tr.setAttribute('tabindex', '0'); tr.setAttribute('role', 'button'); } });
  }).observe(main, { childList: true, subtree: true });
  render(true);
})();

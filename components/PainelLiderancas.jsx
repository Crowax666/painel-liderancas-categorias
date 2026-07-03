'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const CAMPANHA_ID = process.env.NEXT_PUBLIC_CAMPANHA_ID || '6d493722-17d8-4ea2-a488-d1c12d399372';

const REGIONAIS_PADRAO_CURITIBA = [
  { codigo: 'matriz', nome: 'Matriz', mapa: 'curitiba', lat: -25.4284, lng: -49.2733, cor: '#d4a574' },
  { codigo: 'boa-vista', nome: 'Boa Vista', mapa: 'curitiba', lat: -25.396, lng: -49.247, cor: '#5a7c8a' },
  { codigo: 'cajuru', nome: 'Cajuru', mapa: 'curitiba', lat: -25.42, lng: -49.22, cor: '#7a9b6b' },
  { codigo: 'bairro-novo', nome: 'Bairro Novo', mapa: 'curitiba', lat: -25.533, lng: -49.268, cor: '#a67c52' },
  { codigo: 'boqueirao', nome: 'Boqueirão', mapa: 'curitiba', lat: -25.47, lng: -49.235, cor: '#6b8a7a' },
  { codigo: 'pinheirinho', nome: 'Pinheirinho', mapa: 'curitiba', lat: -25.5, lng: -49.285, cor: '#b5542f' },
  { codigo: 'portao', nome: 'Portão', mapa: 'curitiba', lat: -25.465, lng: -49.3, cor: '#8a6b9b' },
  { codigo: 'santa-felicidade', nome: 'Santa Felicidade', mapa: 'curitiba', lat: -25.41, lng: -49.32, cor: '#4a7a8a' },
  { codigo: 'cic', nome: 'Cidade Industrial (CIC)', mapa: 'curitiba', lat: -25.475, lng: -49.335, cor: '#9b8a4a' },
  { codigo: 'tatuquara', nome: 'Tatuquara', mapa: 'curitiba', lat: -25.545, lng: -49.315, cor: '#6b5a8a' }
];

const REGIONAIS_PADRAO_PARANA = [
  { codigo: 'metropolitana', nome: 'Metropolitana de Curitiba', mapa: 'parana', lat: -25.42, lng: -49.1, cor: '#d4a574' },
  { codigo: 'norte-central', nome: 'Norte Central Paranaense', mapa: 'parana', lat: -23.3, lng: -51.3, cor: '#5a7c8a' },
  { codigo: 'norte-pioneiro', nome: 'Norte Pioneiro Paranaense', mapa: 'parana', lat: -23.35, lng: -50.1, cor: '#7a9b6b' },
  { codigo: 'noroeste', nome: 'Noroeste Paranaense', mapa: 'parana', lat: -23.1, lng: -52.8, cor: '#a67c52' },
  { codigo: 'centro-ocidental', nome: 'Centro Ocidental Paranaense', mapa: 'parana', lat: -24.55, lng: -52.4, cor: '#6b8a7a' },
  { codigo: 'oeste', nome: 'Oeste Paranaense', mapa: 'parana', lat: -24.95, lng: -53.9, cor: '#b5542f' },
  { codigo: 'sudoeste', nome: 'Sudoeste Paranaense', mapa: 'parana', lat: -25.9, lng: -53, cor: '#8a6b9b' },
  { codigo: 'centro-sul', nome: 'Centro-Sul Paranaense', mapa: 'parana', lat: -25.95, lng: -51.6, cor: '#4a7a8a' },
  { codigo: 'centro-oriental', nome: 'Centro Oriental Paranaense', mapa: 'parana', lat: -24.75, lng: -50.3, cor: '#9b8a4a' },
  { codigo: 'sudeste', nome: 'Sudeste Paranaense', mapa: 'parana', lat: -25.6, lng: -50.6, cor: '#6b5a8a' }
];

const defaultParams = {
  candidato: 'Eder Bublitz',
  partido: 'Republicanos',
  vvt: 6300000,
  nv: 30,
  vac: 80000,
  nlbModo: 'auto',
  nlbManual: 5
};

const CATEGORIAS_PIN = [
  {
    codigo: 'vermelho-politicos',
    nome: 'Prefeitos, Ex-Prefeitos, Vereadores, Ex-Vereadores, Deputados e Ex-Deputados',
    nomeCurto: 'Políticos e ex-mandatos',
    corNome: 'Vermelho',
    cor: '#ef4444'
  },
  {
    codigo: 'amarelo-publicos',
    nome: 'Funcionários Públicos, Diretores de escolas, Vice-diretores, Secretários e Conselheiros tutelares',
    nomeCurto: 'Serviço público e educação',
    corNome: 'Amarelo',
    cor: '#facc15'
  },
  {
    codigo: 'azul-entidades',
    nome: 'Associação de moradores, ONGs, OSCs e Banco de Alimentos',
    nomeCurto: 'Entidades e associações',
    corNome: 'Azul',
    cor: '#3b82f6'
  },
  {
    codigo: 'verde-produtores',
    nome: 'Produtores Rurais e Permissionários',
    nomeCurto: 'Produtores e permissionários',
    corNome: 'Verde',
    cor: '#22c55e'
  },
  {
    codigo: 'branco-empresarios',
    nome: 'Empresários de grande relevância',
    nomeCurto: 'Empresários relevantes',
    corNome: 'Branco',
    cor: '#ffffff'
  },
  {
    codigo: 'preto-esportivas',
    nome: 'Associações Esportivas',
    nomeCurto: 'Associações esportivas',
    corNome: 'Preto',
    cor: '#111827'
  }
];

function categoriaInfo(codigo) {
  return CATEGORIAS_PIN.find((c) => c.codigo === codigo) || CATEGORIAS_PIN[0];
}


function normalizarRegional(r) {
  return {
    id: r.id || r.codigo,
    codigo: r.codigo,
    nome: r.nome,
    mapa: r.mapa,
    lat: Number(r.lat),
    lng: Number(r.lng),
    cor: r.cor || '#2dd4a0'
  };
}

function normalizarLideranca(l, regionais) {
  const regional = regionais.find((r) => r.id === l.regional_id || r.codigo === l.regional_codigo) || null;
  return {
    id: l.id,
    nome: l.nome || '',
    local: l.local || '',
    mapa: l.mapa || regional?.mapa || 'curitiba',
    regional: regional?.codigo || l.regional || '',
    regional_id: l.regional_id || regional?.id || null,
    lat: Number(l.lat || regional?.lat || 0),
    lng: Number(l.lng || regional?.lng || 0),
    fel: Number(l.fel || 1),
    atuais: Number(l.votos_atuais || 0),
    whatsapp: l.whatsapp || '',
    responsavel: l.responsavel || '',
    observacao: l.observacao || '',
    categoria: l.categoria || l.tipo_lideranca || 'vermelho-politicos',
    exemplo: false,
    criadoEm: l.created_at || '',
    atualizadoEm: l.updated_at || ''
  };
}

function escapeCSV(valor) {
  const texto = String(valor ?? '');
  const protegido = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${protegido.replace(/"/g, '""')}"`;
}

function escapeHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default function PainelLiderancas() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState('');

  const [params, setParams] = useState(defaultParams);
  const [regionais, setRegionais] = useState([...REGIONAIS_PADRAO_CURITIBA, ...REGIONAIS_PADRAO_PARANA].map(normalizarRegional));
  const [liderancas, setLiderancas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [mapaAtivo, setMapaAtivo] = useState('curitiba');
  const [regionalAtiva, setRegionalAtiva] = useState('');
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const mapCuritibaRef = useRef(null);
  const mapParanaRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({ curitiba: {}, parana: {} });
  const tempLatLngRef = useRef(null);

  const nlb = params.nlbModo === 'manual' ? Math.max(Number(params.nlbManual) || 1, 1) : Math.max(liderancas.length, 1);
  const qe = Math.round((Number(params.vvt) || 1) / (Number(params.nv) || 1));
  const vmi = Math.round(qe * 0.1);
  const calcMVL = (fel) => Math.round(((Number(params.vac) || 1) / nlb) * (1 / (Number(fel) || 1)));

  function listaRegionais(mapa) {
    return regionais.filter((r) => r.mapa === mapa);
  }

  function regionalInfo(mapa, codigo) {
    const lista = listaRegionais(mapa);
    return lista.find((r) => r.codigo === codigo || r.id === codigo) || lista[0] || regionais[0];
  }

  function regionalPorCodigo(mapa, codigo) {
    return regionais.find((r) => r.mapa === mapa && r.codigo === codigo) || regionais.find((r) => r.mapa === mapa) || null;
  }

  function statusLideranca(l) {
    const meta = calcMVL(l.fel);
    const pct = meta > 0 ? (Number(l.atuais) || 0) / meta : 0;
    if ((Number(l.atuais) || 0) === 0) return 'sem-votos';
    if (pct < 0.25) return 'abaixo-25';
    if (pct < 0.75) return 'em-andamento';
    if (pct < 1) return 'perto-meta';
    return 'meta-batida';
  }

  function statusTexto(status) {
    const mapa = {
      'sem-votos': 'Sem votos',
      'abaixo-25': 'Abaixo de 25%',
      'em-andamento': 'Em andamento',
      'perto-meta': 'Perto da meta',
      'meta-batida': 'Meta batida'
    };
    return mapa[status] || 'Todos os status';
  }

  async function carregarDados() {
    if (!supabase || !session) return;
    setCarregando(true);
    setErro('');
    try {
      const [{ data: campanha, error: campanhaErro }, { data: regionaisDb, error: regionaisErro }] = await Promise.all([
        supabase.from('campanhas').select('*').eq('id', CAMPANHA_ID).single(),
        supabase.from('regionais').select('*').eq('campanha_id', CAMPANHA_ID).order('mapa').order('nome')
      ]);
      if (campanhaErro) throw campanhaErro;
      if (regionaisErro) throw regionaisErro;

      const regionaisNormalizadas = (regionaisDb || []).map(normalizarRegional);
      setRegionais(regionaisNormalizadas.length ? regionaisNormalizadas : [...REGIONAIS_PADRAO_CURITIBA, ...REGIONAIS_PADRAO_PARANA].map(normalizarRegional));
      setParams((p) => ({
        ...p,
        candidato: campanha?.candidato || p.candidato,
        partido: campanha?.partido || p.partido,
        vac: Number(campanha?.vac || p.vac),
        vvt: Number(campanha?.vvt || p.vvt),
        nv: Number(campanha?.nv || p.nv)
      }));

      const { data: liderancasDb, error: liderancasErro } = await supabase
        .from('liderancas')
        .select('*')
        .eq('campanha_id', CAMPANHA_ID)
        .order('created_at', { ascending: false });
      if (liderancasErro) throw liderancasErro;
      setLiderancas((liderancasDb || []).map((l) => normalizarLideranca(l, regionaisNormalizadas)));
    } catch (e) {
      setErro(e.message || 'Erro ao carregar dados do Supabase.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setErro('As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não foram encontradas.');
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSession(novaSessao || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) carregarDados();
  }, [session]);

  useEffect(() => {
    let cancelado = false;
    async function iniciarMapas() {
      if (leafletRef.current || typeof window === 'undefined' || !session) return;
      const L = await import('leaflet');
      if (cancelado) return;
      leafletRef.current = L;

      if (!mapCuritibaRef.current) {
        mapCuritibaRef.current = L.map('map-curitiba').setView([-25.455, -49.28], 11);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19 }).addTo(mapCuritibaRef.current);
        mapCuritibaRef.current.on('click', (e) => abrirFormularioComCoordenada('curitiba', e.latlng));
      }

      if (!mapParanaRef.current) {
        mapParanaRef.current = L.map('map-parana').setView([-24.6, -51.5], 6);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19 }).addTo(mapParanaRef.current);
        mapParanaRef.current.on('click', (e) => abrirFormularioComCoordenada('parana', e.latlng));
      }
      setMapReady(true);
    }
    iniciarMapas();
    return () => { cancelado = true; };
  }, [session]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;
    const L = leafletRef.current;

    Object.values(markersRef.current.curitiba).forEach((m) => mapCuritibaRef.current?.removeLayer(m));
    Object.values(markersRef.current.parana).forEach((m) => mapParanaRef.current?.removeLayer(m));
    markersRef.current = { curitiba: {}, parana: {} };

    liderancas.forEach((l) => {
      const info = regionalInfo(l.mapa, l.regional);
      const cat = categoriaInfo(l.categoria);
      if (!info || !Number.isFinite(Number(l.lat)) || !Number.isFinite(Number(l.lng))) return;
      const mapObj = l.mapa === 'curitiba' ? mapCuritibaRef.current : mapParanaRef.current;
      if (!mapObj) return;
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:${cat.cor};transform:rotate(-45deg);border:2px solid ${cat.codigo === 'branco-empresarios' ? 'rgba(17,24,39,.95)' : 'rgba(20,27,35,.75)'};box-shadow:0 2px 5px rgba(0,0,0,.4)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 16], popupAnchor: [0, -16]
      });
      const meta = calcMVL(l.fel);
      const pct = meta > 0 ? Math.min(100, Math.round(((Number(l.atuais) || 0) / meta) * 100)) : 0;
      const html = `<div class="pin-popup"><h4>${escapeHTML(l.nome)}</h4><div>${escapeHTML(l.local)} · ${escapeHTML(info.nome)}</div><div class="pin-cat"><span style="background:${cat.cor}"></span>${escapeHTML(cat.corNome)} — ${escapeHTML(cat.nomeCurto)}</div><p>Meta: <b>${meta.toLocaleString('pt-BR')}</b><br/>Captados: <b>${Number(l.atuais || 0).toLocaleString('pt-BR')} (${pct}%)</b></p></div>`;
      const marker = L.marker([Number(l.lat), Number(l.lng)], { icon }).addTo(mapObj).bindPopup(html);
      marker.on('click', () => setEditando(l));
      markersRef.current[l.mapa][l.id] = marker;
    });
  }, [liderancas, params, regionais, mapReady]);

  useEffect(() => {
    setRegionalAtiva('');
    setTimeout(() => {
      const map = mapaAtivo === 'curitiba' ? mapCuritibaRef.current : mapParanaRef.current;
      if (map) map.invalidateSize();
    }, 80);
  }, [mapaAtivo]);

  async function fazerLogin(event) {
    event.preventDefault();
    setLoginErro('');
    if (!supabase) return setLoginErro('Supabase não configurado.');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginSenha });
    if (error) setLoginErro(error.message || 'Não foi possível fazer login.');
  }

  async function sair() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setLiderancas([]);
  }

  function abrirFormularioComCoordenada(mapa, latlng) {
    tempLatLngRef.current = { mapa, lat: latlng.lat, lng: latlng.lng };
    setEditando(null);
    setFormAberto(true);
  }

  function abrirNovaLideranca() {
    const primeira = listaRegionais(mapaAtivo)[0];
    tempLatLngRef.current = { mapa: mapaAtivo, lat: primeira?.lat || -25.455, lng: primeira?.lng || -49.28 };
    setEditando(null);
    setFormAberto(true);
  }

  async function salvarLideranca(event) {
    event.preventDefault();
    if (!supabase || !session) return alert('Faça login novamente.');
    const fd = new FormData(event.currentTarget);
    const dados = Object.fromEntries(fd.entries());
    const mapa = dados.mapa || mapaAtivo;
    const regionalCodigo = dados.regional || listaRegionais(mapa)[0]?.codigo;
    const regional = regionalPorCodigo(mapa, regionalCodigo);
    const existenteId = dados.id || null;

    const nome = String(dados.nome || '').trim();
    if (!nome) return alert('Informe o nome da liderança.');

    const duplicada = liderancas.some((l) => l.id !== existenteId && l.nome.trim().toLowerCase() === nome.toLowerCase());
    if (duplicada && !confirm('Já existe uma liderança com esse nome. Deseja salvar mesmo assim?')) return;

    const latPadrao = tempLatLngRef.current?.lat ?? regional?.lat;
    const lngPadrao = tempLatLngRef.current?.lng ?? regional?.lng;
    const payload = {
      campanha_id: CAMPANHA_ID,
      regional_id: regional?.id || null,
      nome,
      local: String(dados.local || regional?.nome || '').trim(),
      mapa,
      lat: Number(dados.lat || latPadrao || 0),
      lng: Number(dados.lng || lngPadrao || 0),
      fel: Number(dados.fel || 1),
      votos_atuais: Number(dados.atuais || 0),
      whatsapp: String(dados.whatsapp || '').trim(),
      responsavel: String(dados.responsavel || '').trim(),
      observacao: String(dados.observacao || '').trim(),
      categoria: String(dados.categoria || 'vermelho-politicos'),
      created_by: session.user.id,
      updated_at: new Date().toISOString()
    };

    if (payload.votos_atuais > calcMVL(payload.fel) && !confirm('Os votos captados estão acima da meta. Deseja salvar mesmo assim?')) return;

    setCarregando(true);
    setErro('');
    const query = existenteId
      ? supabase.from('liderancas').update(payload).eq('id', existenteId).select('*').single()
      : supabase.from('liderancas').insert(payload).select('*').single();
    const { error } = await query;
    setCarregando(false);
    if (error) {
      setErro(error.message || 'Erro ao salvar liderança.');
      return;
    }
    setFormAberto(false);
    setEditando(null);
    await carregarDados();
  }

  async function excluirLideranca(id) {
    if (!supabase || !session) return alert('Faça login novamente.');
    if (!confirm('Deseja excluir esta liderança?')) return;
    setCarregando(true);
    setErro('');
    const { error } = await supabase.from('liderancas').delete().eq('id', id);
    setCarregando(false);
    if (error) {
      setErro(error.message || 'Erro ao excluir. Apenas administradores podem excluir.');
      return;
    }
    setEditando(null);
    await carregarDados();
  }



  function linhaLideranca(l) {
    const regionalNome = regionalInfo(l.mapa, l.regional)?.nome || '';
    const meta = calcMVL(l.fel);
    const votos = Number(l.atuais) || 0;
    const percentual = meta > 0 ? Math.round((votos / meta) * 100) : 0;
    return {
      'Nome': l.nome || '',
      'Local': l.local || '',
      'Regional': regionalNome,
      'Categoria do pin': categoriaInfo(l.categoria).nomeCurto,
      'Descrição da categoria': categoriaInfo(l.categoria).nome,
      'Cor do pin': categoriaInfo(l.categoria).corNome,
      'HEX do pin': categoriaInfo(l.categoria).cor,
      'Mapa': l.mapa === 'curitiba' ? 'Curitiba' : 'Paraná',
      'Latitude': Number(l.lat) || 0,
      'Longitude': Number(l.lng) || 0,
      'FEL': Number(l.fel) || 1,
      'Meta MVL': meta,
      'Votos atuais': votos,
      '% da meta': percentual,
      'Status': statusTexto(statusLideranca(l)),
      'WhatsApp': l.whatsapp || '',
      'Responsável': l.responsavel || '',
      'Observação': l.observacao || '',
      'Criado em': l.criadoEm ? new Date(l.criadoEm).toLocaleString('pt-BR') : '',
      'Atualizado em': l.atualizadoEm ? new Date(l.atualizadoEm).toLocaleString('pt-BR') : ''
    };
  }

  function ajustarColunas(ws, larguras) {
    ws['!cols'] = larguras.map((wch) => ({ wch }));
  }

  async function exportarExcel() {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const todas = liderancas.map(linhaLideranca);
      const wsTodas = XLSX.utils.json_to_sheet(todas.length ? todas : [{ 'Aviso': 'Nenhuma liderança cadastrada ainda.' }]);
      ajustarColunas(wsTodas, [28, 24, 30, 26, 48, 14, 12, 14, 12, 12, 8, 12, 14, 10, 18, 18, 22, 36, 20, 20]);
      XLSX.utils.book_append_sheet(wb, wsTodas, 'Todas lideranças');

      const resumo = regionais.map((r) => {
        const itens = liderancas.filter((l) => l.regional === r.codigo && l.mapa === r.mapa);
        const meta = itens.reduce((s, l) => s + calcMVL(l.fel), 0);
        const votos = itens.reduce((s, l) => s + (Number(l.atuais) || 0), 0);
        return {
          'Regional': r.nome,
          'Mapa': r.mapa === 'curitiba' ? 'Curitiba' : 'Paraná',
          'Lideranças': itens.length,
          'Meta total': meta,
          'Votos atuais': votos,
          '% realizado': meta > 0 ? Math.round((votos / meta) * 100) : 0
        };
      });
      const wsResumo = XLSX.utils.json_to_sheet(resumo);
      ajustarColunas(wsResumo, [34, 14, 12, 14, 14, 12]);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo regionais');

      const resumoCategorias = CATEGORIAS_PIN.map((c) => {
        const itens = liderancas.filter((l) => categoriaInfo(l.categoria).codigo === c.codigo);
        const meta = itens.reduce((s, l) => s + calcMVL(l.fel), 0);
        const votos = itens.reduce((s, l) => s + (Number(l.atuais) || 0), 0);
        return {
          'Cor do pin': c.corNome,
          'Categoria': c.nomeCurto,
          'Descrição': c.nome,
          'HEX': c.cor,
          'Lideranças': itens.length,
          'Meta total': meta,
          'Votos atuais': votos,
          '% realizado': meta > 0 ? Math.round((votos / meta) * 100) : 0
        };
      });
      const wsCategorias = XLSX.utils.json_to_sheet(resumoCategorias);
      ajustarColunas(wsCategorias, [14, 28, 56, 12, 12, 14, 14, 12]);
      XLSX.utils.book_append_sheet(wb, wsCategorias, 'Resumo pins');

      const ranking = [...liderancas]
        .sort((a, b) => (Number(b.atuais) || 0) - (Number(a.atuais) || 0))
        .map(linhaLideranca);
      const wsRanking = XLSX.utils.json_to_sheet(ranking.length ? ranking : [{ 'Aviso': 'Nenhuma liderança cadastrada ainda.' }]);
      ajustarColunas(wsRanking, [28, 24, 30, 26, 48, 14, 12, 14, 12, 12, 8, 12, 14, 10, 18, 18, 22, 36, 20, 20]);
      XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking votos');

      const pendencias = liderancas
        .filter((l) => (Number(l.atuais) || 0) === 0 || !l.whatsapp || !l.responsavel)
        .map(linhaLideranca);
      const wsPendencias = XLSX.utils.json_to_sheet(pendencias.length ? pendencias : [{ 'Aviso': 'Nenhuma pendência encontrada.' }]);
      ajustarColunas(wsPendencias, [28, 24, 30, 26, 48, 14, 12, 14, 12, 12, 8, 12, 14, 10, 18, 18, 22, 36, 20, 20]);
      XLSX.utils.book_append_sheet(wb, wsPendencias, 'Pendências');

      const contatos = liderancas.map((l) => ({
        'Nome': l.nome || '',
        'WhatsApp': l.whatsapp || '',
        'Responsável': l.responsavel || '',
        'Categoria do pin': categoriaInfo(l.categoria).nomeCurto,
        'Cor do pin': categoriaInfo(l.categoria).corNome,
        'Regional': regionalInfo(l.mapa, l.regional)?.nome || '',
        'Local': l.local || ''
      }));
      const wsContatos = XLSX.utils.json_to_sheet(contatos.length ? contatos : [{ 'Aviso': 'Nenhum contato cadastrado ainda.' }]);
      ajustarColunas(wsContatos, [28, 18, 24, 26, 14, 30, 24]);
      XLSX.utils.book_append_sheet(wb, wsContatos, 'Contatos WhatsApp');

      const nomeArquivo = `liderancas-${params.candidato || 'campanha'}-${new Date().toISOString().slice(0, 10)}`
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

      XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
    } catch (e) {
      setErro(e.message || 'Erro ao gerar planilha Excel.');
    }
  }

  function exportarCSV() {
    const linhas = [['nome', 'local', 'regional', 'categoria_pin', 'descricao_categoria', 'cor_pin', 'hex_pin', 'mapa', 'lat', 'lng', 'fel', 'meta_mvl', 'votos_atuais', 'status', 'whatsapp', 'responsavel', 'observacao', 'criado_em', 'atualizado_em']];
    liderancas.forEach((l) => {
      linhas.push([
        l.nome, l.local, regionalInfo(l.mapa, l.regional)?.nome || '', categoriaInfo(l.categoria).nomeCurto, categoriaInfo(l.categoria).nome, categoriaInfo(l.categoria).corNome, categoriaInfo(l.categoria).cor, l.mapa, l.lat, l.lng, l.fel, calcMVL(l.fel), l.atuais || 0,
        statusTexto(statusLideranca(l)), l.whatsapp || '', l.responsavel || '', l.observacao || '', l.criadoEm || '', l.atualizadoEm || ''
      ].map((campo) => String(campo ?? '')));
    });
    const csv = linhas.map((linha) => linha.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liderancas_bublitz_supabase.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const itensFiltrados = liderancas
    .filter((l) => l.mapa === mapaAtivo)
    .filter((l) => !regionalAtiva || l.regional === regionalAtiva)
    .filter((l) => !statusFiltro || statusLideranca(l) === statusFiltro)
    .filter((l) => {
      const q = busca.toLowerCase().trim();
      return !q || l.nome.toLowerCase().includes(q) || l.local.toLowerCase().includes(q) || (l.responsavel || '').toLowerCase().includes(q);
    });

  const somaMetas = liderancas.reduce((s, l) => s + calcMVL(l.fel), 0);
  const somaAtuais = liderancas.reduce((s, l) => s + (Number(l.atuais) || 0), 0);
  const progresso = somaMetas > 0 ? Math.min(100, Math.round((somaAtuais / somaMetas) * 100)) : 0;

  const resumoRegionais = listaRegionais(mapaAtivo).map((r) => {
    const itens = liderancas.filter((l) => l.mapa === mapaAtivo && l.regional === r.codigo);
    return { ...r, qtd: itens.length, votos: itens.reduce((s, l) => s + (Number(l.atuais) || 0), 0), meta: itens.reduce((s, l) => s + calcMVL(l.fel), 0) };
  });

  const regionalInicial = listaRegionais(mapaAtivo)[0] || regionais[0];
  const dadosFormulario = editando || {
    id: '', nome: '', local: '', mapa: tempLatLngRef.current?.map || mapaAtivo, regional: regionalInicial?.codigo || '',
    lat: tempLatLngRef.current?.lat || regionalInicial?.lat || 0, lng: tempLatLngRef.current?.lng || regionalInicial?.lng || 0,
    fel: 1, atuais: 0, whatsapp: '', responsavel: '', observacao: '', categoria: 'vermelho-politicos'
  };

  if (authLoading) {
    return <main className="painel-root"><section className="login-card"><h1>Carregando painel...</h1></section></main>;
  }

  if (!session) {
    return (
      <main className="painel-root login-screen">
        <form className="login-card" onSubmit={fazerLogin}>
          <div className="eyebrow">Painel de Campanha</div>
          <h1>Entrar no painel</h1>
          <p>Use o usuário criado no Supabase para acessar as lideranças da campanha.</p>
          {erro && <div className="notice error">{erro}</div>}
          {loginErro && <div className="notice error">{loginErro}</div>}
          <Field label="E-mail"><input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></Field>
          <Field label="Senha"><input type="password" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} required /></Field>
          <button className="btn" type="submit">Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="painel-root">
      <header className="topbar">
        <div className="brand"><div className="eyebrow">Painel de Campanha</div><h1>{params.candidato} · {params.partido}</h1></div>
        <div className="top-actions">
          <button className="btn small" onClick={abrirNovaLideranca}>+ Nova liderança</button>
          <button className="params-toggle" onClick={() => setDrawer((v) => !v)}>⚙ Parâmetros</button>
          <button className="params-toggle" onClick={carregarDados}>{carregando ? 'Sincronizando...' : 'Sincronizar'}</button>
          <button className="params-toggle" onClick={sair}>Sair</button>
        </div>
      </header>

      <section className="notice">Conectado ao Supabase. Os dados agora ficam no banco e são compartilhados com usuários autorizados da campanha.</section>
      {erro && <section className="notice error">{erro}</section>}

      <section className="stats-grid">
        <Stat badge="VAC" value={Number(params.vac).toLocaleString('pt-BR')} caption="Meta de votos do candidato" gold />
        <Stat badge="QE" value={qe.toLocaleString('pt-BR')} caption="VVT ÷ número de vagas" />
        <Stat badge="VMI" value={vmi.toLocaleString('pt-BR')} caption="10% do quociente eleitoral" />
        <Stat badge="NLB" value={nlb} caption="Lideranças consideradas" />
        <Stat badge="MVL" value={somaMetas.toLocaleString('pt-BR')} caption="Soma das metas individuais" gold />
      </section>

      {drawer && (
        <section className="params-grid">
          <Field label="Candidato"><input value={params.candidato} onChange={(e) => setParams({ ...params, candidato: e.target.value })} /></Field>
          <Field label="Partido"><input value={params.partido} onChange={(e) => setParams({ ...params, partido: e.target.value })} /></Field>
          <Field label="VVT"><input type="number" value={params.vvt} onChange={(e) => setParams({ ...params, vvt: Number(e.target.value) || 1 })} /></Field>
          <Field label="Nº vagas"><input type="number" value={params.nv} onChange={(e) => setParams({ ...params, nv: Number(e.target.value) || 1 })} /></Field>
          <Field label="VAC"><input type="number" value={params.vac} onChange={(e) => setParams({ ...params, vac: Number(e.target.value) || 1 })} /></Field>
          <Field label="NLB"><select value={params.nlbModo} onChange={(e) => setParams({ ...params, nlbModo: e.target.value })}><option value="auto">Automático</option><option value="manual">Manual</option></select></Field>
          {params.nlbModo === 'manual' && <Field label="NLB manual"><input type="number" value={params.nlbManual} onChange={(e) => setParams({ ...params, nlbManual: Number(e.target.value) || 1 })} /></Field>}
        </section>
      )}

      <section className="body-grid">
        <div className="map-col">
          <div className="tabs"><button className={mapaAtivo === 'curitiba' ? 'active' : ''} onClick={() => setMapaAtivo('curitiba')}>Regional Curitiba</button><button className={mapaAtivo === 'parana' ? 'active' : ''} onClick={() => setMapaAtivo('parana')}>Estado do Paraná</button></div>
          <div className="regional-buttons"><button className={!regionalAtiva ? 'active' : ''} onClick={() => setRegionalAtiva('')}>Todas</button>{listaRegionais(mapaAtivo).map((r) => <button key={r.id} className={regionalAtiva === r.codigo ? 'active' : ''} onClick={() => setRegionalAtiva(r.codigo)}>{r.nome}</button>)}</div>
          <div className="pin-legend">{CATEGORIAS_PIN.map((c) => <span key={c.codigo}><i style={{ background: c.cor, borderColor: c.codigo === 'branco-empresarios' ? '#111827' : 'transparent' }} />{c.corNome}: {c.nomeCurto}</span>)}</div>

          <div className="board" style={{ display: mapaAtivo === 'curitiba' ? 'flex' : 'none' }}><div className="board-head"><h2>Mapa de Lideranças — Curitiba</h2><span>clique no mapa para cadastrar</span></div><div id="map-curitiba" className="mapa"></div></div>
          <div className="board" style={{ display: mapaAtivo === 'parana' ? 'flex' : 'none' }}><div className="board-head"><h2>Mapa de Lideranças — Paraná</h2><span>clique no mapa para cadastrar</span></div><div id="map-parana" className="mapa"></div></div>

          <div className="resumo-regionais">{resumoRegionais.map((r) => <div key={r.id} className="mini-card"><b>{r.nome}</b><span>{r.qtd} lideranças · {r.votos.toLocaleString('pt-BR')} votos · meta {r.meta.toLocaleString('pt-BR')}</span></div>)}</div>
        </div>

        <aside className="sidebar">
          <h3>Lideranças cadastradas</h3>
          <input className="input-full" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="buscar nome, bairro ou responsável..." />
          <select className="input-full" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}><option value="">Todos os status</option><option value="sem-votos">Sem votos</option><option value="abaixo-25">Abaixo de 25%</option><option value="em-andamento">Em andamento</option><option value="perto-meta">Perto da meta</option><option value="meta-batida">Meta batida</option></select>

          <div className="lideranca-list">
            {carregando && <p className="empty">Carregando dados...</p>}
            {!carregando && itensFiltrados.length === 0 && <p className="empty">Nenhuma liderança encontrada.</p>}
            {itensFiltrados.map((l) => { const meta = calcMVL(l.fel); const pct = meta > 0 ? Math.min(100, Math.round(((Number(l.atuais) || 0) / meta) * 100)) : 0; return <button key={l.id} className="l-card" style={{ borderLeftColor: categoriaInfo(l.categoria).cor }} onClick={() => setEditando(l)}><div><b>{l.nome}</b><span>{meta.toLocaleString('pt-BR')}</span></div><small>{l.local} · {regionalInfo(l.mapa, l.regional)?.nome || ''}<br />{categoriaInfo(l.categoria).corNome}: {categoriaInfo(l.categoria).nomeCurto}</small><i><em style={{ width: `${pct}%` }} /></i></button>; })}
          </div>

          <div className="sidebar-footer"><div className="progress-label"><span>votos captados</span><span>{somaAtuais.toLocaleString('pt-BR')} / {somaMetas.toLocaleString('pt-BR')}</span></div><div className="progress-outer"><div className="progress-inner" style={{ width: `${progresso}%` }} /></div><button className="btn" onClick={exportarExcel}>Exportar Excel</button><button className="btn ghost" onClick={exportarCSV}>Exportar CSV</button></div>
        </aside>
      </section>

      {(formAberto || editando) && (
        <div className="modal-bg" onClick={() => { setFormAberto(false); setEditando(null); }}>
          <form className="modal" onSubmit={salvarLideranca} onClick={(e) => e.stopPropagation()}>
            <h2>{editando ? 'Editar liderança' : 'Nova liderança'}</h2>
            <input type="hidden" name="id" defaultValue={dadosFormulario.id || ''} />
            <Field label="Nome"><input name="nome" defaultValue={dadosFormulario.nome} required /></Field>
            <Field label="Bairro / cidade"><input name="local" defaultValue={dadosFormulario.local} /></Field>
            <Field label="Categoria / cor do pin"><select name="categoria" defaultValue={dadosFormulario.categoria || 'vermelho-politicos'}>{CATEGORIAS_PIN.map((c) => <option key={c.codigo} value={c.codigo}>{c.corNome} — {c.nome}</option>)}</select></Field>
            <div className="grid-2"><Field label="Mapa"><select name="mapa" defaultValue={dadosFormulario.mapa}><option value="curitiba">Curitiba</option><option value="parana">Paraná</option></select></Field><Field label="Regional"><select name="regional" defaultValue={dadosFormulario.regional}>{listaRegionais(dadosFormulario.mapa || mapaAtivo).map((r) => <option key={r.id} value={r.codigo}>{r.nome}</option>)}</select></Field></div>
            <div className="grid-2"><Field label="Latitude"><input name="lat" defaultValue={dadosFormulario.lat} /></Field><Field label="Longitude"><input name="lng" defaultValue={dadosFormulario.lng} /></Field></div>
            <div className="grid-2"><Field label="FEL"><input name="fel" type="number" min="0.5" max="2" step="0.01" defaultValue={dadosFormulario.fel} /></Field><Field label="Votos captados"><input name="atuais" type="number" min="0" defaultValue={dadosFormulario.atuais} /></Field></div>
            <Field label="WhatsApp"><input name="whatsapp" defaultValue={dadosFormulario.whatsapp} placeholder="(41) 99999-9999" /></Field>
            <Field label="Responsável"><input name="responsavel" defaultValue={dadosFormulario.responsavel} /></Field>
            <Field label="Observação"><textarea name="observacao" defaultValue={dadosFormulario.observacao} /></Field>
            <div className="modal-actions">{editando && <button type="button" className="btn danger" onClick={() => excluirLideranca(editando.id)}>Excluir</button>}<button type="button" className="btn ghost" onClick={() => { setFormAberto(false); setEditando(null); }}>Cancelar</button><button className="btn" type="submit">Salvar</button></div>
          </form>
        </div>
      )}
    </main>
  );
}

function Stat({ badge, value, caption, gold }) {
  return <div className={`stat-card ${gold ? 'gold' : ''}`}><span>{badge}</span><b>{value}</b><small>{caption}</small></div>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

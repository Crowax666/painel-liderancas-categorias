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

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap &copy; CARTO';
const TILE_MAX_ZOOM = 19;

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

function formatarWhatsApp(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 11);
  if (!digitos) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function corPinBorda(categoria) {
  return categoria.codigo === 'branco-empresarios' ? '#111827' : 'rgba(255,255,255,.92)';
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
    meta_votos: l.meta_votos == null ? null : Number(l.meta_votos || 0),
    whatsapp: formatarWhatsApp(l.whatsapp || ''),
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


function deslocarCoordenadaPin(lideranca, indice, total) {
  const latBase = Number(lideranca.lat);
  const lngBase = Number(lideranca.lng);
  if (!Number.isFinite(latBase) || !Number.isFinite(lngBase) || total <= 1) {
    return { lat: latBase, lng: lngBase };
  }

  const raioBase = lideranca.mapa === 'parana' ? 0.018 : 0.00055;
  const raio = raioBase * Math.sqrt(total);
  const angulo = (Math.PI * 2 * indice) / total;
  return {
    lat: latBase + Math.sin(angulo) * raio,
    lng: lngBase + Math.cos(angulo) * raio
  };
}

function chaveCoordenada(lideranca) {
  return `${lideranca.mapa}:${Number(lideranca.lat).toFixed(6)}:${Number(lideranca.lng).toFixed(6)}`;
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
  const [cidadeAtiva, setCidadeAtiva] = useState('');
  const [regionalExpandida, setRegionalExpandida] = useState('');
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [formMapa, setFormMapa] = useState(mapaAtivo);

  const mapCuritibaRef = useRef(null);
  const mapParanaRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({ curitiba: {}, parana: {} });
  const tempLatLngRef = useRef(null);
  const sidebarRef = useRef(null);
  const localInputRef = useRef(null);
  const latInputRef = useRef(null);
  const lngInputRef = useRef(null);
  const localOriginalRef = useRef('');
  const [geocodando, setGeocodando] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState('');

  const nlb = params.nlbModo === 'manual' ? Math.max(Number(params.nlbManual) || 1, 1) : Math.max(liderancas.length, 1);
  const qe = Math.round((Number(params.vvt) || 1) / (Number(params.nv) || 1));
  const vmi = Math.round(qe * 0.1);
  const calcMVL = (fel) => Math.round(((Number(params.vac) || 1) / nlb) * (1 / (Number(fel) || 1)));
  const metaLideranca = (l) => {
    const valor = Number(l?.meta_votos);
    if (Number.isFinite(valor) && valor > 0) return Math.round(valor);
    return calcMVL(l?.fel || 1);
  };

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
    const meta = metaLideranca(l);
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
        L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: TILE_MAX_ZOOM }).addTo(mapCuritibaRef.current);
        mapCuritibaRef.current.on('click', (e) => abrirFormularioComCoordenada('curitiba', e.latlng));
      }

      if (!mapParanaRef.current) {
        mapParanaRef.current = L.map('map-parana').setView([-24.6, -51.5], 6);
        L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: TILE_MAX_ZOOM }).addTo(mapParanaRef.current);
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

    const gruposPorCoordenada = liderancas.reduce((acc, l) => {
      const chave = chaveCoordenada(l);
      acc[chave] = acc[chave] || [];
      acc[chave].push(l.id);
      return acc;
    }, {});
    const indicePorCoordenada = {};

    liderancas.forEach((l) => {
      const info = regionalInfo(l.mapa, l.regional);
      const cat = categoriaInfo(l.categoria);
      if (!info || !Number.isFinite(Number(l.lat)) || !Number.isFinite(Number(l.lng))) return;
      const mapObj = l.mapa === 'curitiba' ? mapCuritibaRef.current : mapParanaRef.current;
      if (!mapObj) return;

      const chave = chaveCoordenada(l);
      indicePorCoordenada[chave] = indicePorCoordenada[chave] || 0;
      const indice = indicePorCoordenada[chave];
      const total = gruposPorCoordenada[chave]?.length || 1;
      indicePorCoordenada[chave] += 1;
      const posicaoVisual = deslocarCoordenadaPin(l, indice, total);

      const stroke = corPinBorda(cat);
      const icon = L.divIcon({
        className: 'leader-pin-icon',
        html: `<svg class="leader-pin-svg" width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg" aria-label="${escapeHTML(cat.corNome)}"><path d="M17 40C17 40 31 26.8 31 15.5C31 7.5 24.73 2 17 2C9.27 2 3 7.5 3 15.5C3 26.8 17 40 17 40Z" fill="${cat.cor}" stroke="${stroke}" stroke-width="3"/><circle cx="17" cy="15.5" r="4.8" fill="rgba(255,255,255,.86)" stroke="rgba(0,0,0,.28)" stroke-width="1"/></svg>`,
        iconSize: [34, 42], iconAnchor: [17, 42], popupAnchor: [0, -38]
      });
      const meta = metaLideranca(l);
      const pct = meta > 0 ? Math.min(100, Math.round(((Number(l.atuais) || 0) / meta) * 100)) : 0;
      const deslocado = total > 1 ? `<div class="pin-note">Pin individual deslocado levemente para não ficar sobreposto a outros cadastros da mesma regional.</div>` : '';
      const html = `<div class="pin-popup"><h4>${escapeHTML(l.nome)}</h4><div>${escapeHTML(l.local)} · ${escapeHTML(info.nome)}</div><div class="pin-cat"><span style="background:${cat.cor};border-color:${corPinBorda(cat)}"></span>${escapeHTML(cat.corNome)} — ${escapeHTML(cat.nomeCurto)}</div><p>Meta: <b>${meta.toLocaleString('pt-BR')}</b><br/>Captados: <b>${Number(l.atuais || 0).toLocaleString('pt-BR')} (${pct}%)</b></p>${deslocado}</div>`;
      const marker = L.marker([posicaoVisual.lat, posicaoVisual.lng], { icon }).addTo(mapObj).bindPopup(html);
      marker.on('click', () => setEditando(l));
      markersRef.current[l.mapa][l.id] = marker;
    });
  }, [liderancas, params, regionais, mapReady]);

  useEffect(() => {
    setRegionalAtiva('');
    setCidadeAtiva('');
    setRegionalExpandida('');
    setTimeout(() => {
      const map = mapaAtivo === 'curitiba' ? mapCuritibaRef.current : mapParanaRef.current;
      if (map) map.invalidateSize();
    }, 80);
  }, [mapaAtivo]);

  useEffect(() => {
    if (formAberto || editando) {
      setFormMapa(editando?.mapa || tempLatLngRef.current?.mapa || mapaAtivo);
      localOriginalRef.current = editando?.local || '';
      setGeocodeMsg('');
    }
  }, [formAberto, editando]);

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
      meta_votos: Number(dados.meta_votos || 0),
      whatsapp: formatarWhatsApp(dados.whatsapp || ''),
      responsavel: String(dados.responsavel || '').trim(),
      observacao: String(dados.observacao || '').trim(),
      categoria: String(dados.categoria || 'vermelho-politicos'),
      created_by: session.user.id,
      updated_at: new Date().toISOString()
    };

    if (payload.votos_atuais > Number(payload.meta_votos || 0) && !confirm('Os votos captados estão acima da meta. Deseja salvar mesmo assim?')) return;

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



  async function geocodificarEndereco(textoDigitado) {
    const texto = String(textoDigitado || '').trim();
    if (!texto) return;
    setGeocodando(true);
    setGeocodeMsg('');
    try {
      const query = formMapa === 'parana' ? `${texto}, Paraná, Brasil` : `${texto}, Curitiba, Paraná, Brasil`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&accept-language=pt-BR&viewbox=-54.62,-22.29,-48.02,-26.72&bounded=0&q=${encodeURIComponent(query)}`;
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      const dados = await resp.json();
      if (dados && dados[0]) {
        const lat = Number(dados[0].lat).toFixed(6);
        const lng = Number(dados[0].lon).toFixed(6);
        if (latInputRef.current) latInputRef.current.value = lat;
        if (lngInputRef.current) lngInputRef.current.value = lng;
        setGeocodeMsg(`📍 Local encontrado automaticamente: ${dados[0].display_name}`);
      } else {
        setGeocodeMsg('Não encontramos esse endereço automaticamente. Ajuste a latitude/longitude manualmente ou clique no mapa.');
      }
    } catch (e) {
      setGeocodeMsg('Não foi possível localizar automaticamente agora. Ajuste manualmente ou clique no mapa.');
    } finally {
      setGeocodando(false);
    }
  }

  function separarBairroCidade(local) {
    const texto = String(local || '').trim();
    if (!texto) return { bairro: '', cidade: '' };
    const partes = texto.split(',').map((p) => p.trim()).filter(Boolean);
    if (partes.length >= 2) {
      return { bairro: partes[0], cidade: partes.slice(1).join(', ') };
    }
    return { bairro: texto, cidade: '' };
  }

  function extrairCidade(local) {
    const { bairro, cidade } = separarBairroCidade(local);
    return cidade || bairro || 'Cidade não informada';
  }

  function linhaLideranca(l) {
    const regionalNome = regionalInfo(l.mapa, l.regional)?.nome || '';
    const meta = metaLideranca(l);
    const votos = Number(l.atuais) || 0;
    const { bairro, cidade } = separarBairroCidade(l.local);
    const categoria = categoriaInfo(l.categoria);
    return {
      'Nome': l.nome || '',
      'Bairro': bairro,
      'Cidade': cidade,
      'Regional': regionalNome,
      'Nome da categoria': categoria.corNome,
      'Descrição da categoria': categoria.nome,
      'Quantidade de votos previstos': meta,
      'Quantidade de votos alcançados': votos
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
      ajustarColunas(wsTodas, [30, 24, 24, 30, 22, 58, 28, 28]);
      XLSX.utils.book_append_sheet(wb, wsTodas, 'Todas lideranças');

      const resumo = regionais.map((r) => {
        const itens = liderancas.filter((l) => l.regional === r.codigo && l.mapa === r.mapa);
        const meta = itens.reduce((s, l) => s + metaLideranca(l), 0);
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
        const meta = itens.reduce((s, l) => s + metaLideranca(l), 0);
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
      ajustarColunas(wsRanking, [30, 24, 24, 30, 22, 58, 28, 28]);
      XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking votos');

      const pendencias = liderancas
        .filter((l) => (Number(l.atuais) || 0) === 0 || !l.whatsapp || !l.responsavel)
        .map(linhaLideranca);
      const wsPendencias = XLSX.utils.json_to_sheet(pendencias.length ? pendencias : [{ 'Aviso': 'Nenhuma pendência encontrada.' }]);
      ajustarColunas(wsPendencias, [30, 24, 24, 30, 22, 58, 28, 28]);
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
    const linhas = [[
      'nome',
      'bairro',
      'cidade',
      'regional',
      'nome_categoria',
      'descricao_categoria',
      'quantidade_votos_previstos',
      'quantidade_votos_alcancados'
    ]];
    liderancas.forEach((l) => {
      const linha = linhaLideranca(l);
      linhas.push([
        linha['Nome'],
        linha['Bairro'],
        linha['Cidade'],
        linha['Regional'],
        linha['Nome da categoria'],
        linha['Descrição da categoria'],
        linha['Quantidade de votos previstos'],
        linha['Quantidade de votos alcançados']
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
    .filter((l) => !cidadeAtiva || extrairCidade(l.local) === cidadeAtiva)
    .filter((l) => !statusFiltro || statusLideranca(l) === statusFiltro)
    .filter((l) => {
      const q = busca.toLowerCase().trim();
      return !q || l.nome.toLowerCase().includes(q) || l.local.toLowerCase().includes(q) || (l.responsavel || '').toLowerCase().includes(q);
    });

  const somaMetas = liderancas.reduce((s, l) => s + metaLideranca(l), 0);
  const somaAtuais = liderancas.reduce((s, l) => s + (Number(l.atuais) || 0), 0);
  const progresso = somaMetas > 0 ? Math.min(100, Math.round((somaAtuais / somaMetas) * 100)) : 0;

  const resumoRegionais = listaRegionais(mapaAtivo).map((r) => {
    const itens = liderancas.filter((l) => l.mapa === mapaAtivo && l.regional === r.codigo);
    const cidadesMap = {};
    itens.forEach((l) => {
      const cidade = extrairCidade(l.local);
      if (!cidadesMap[cidade]) cidadesMap[cidade] = { cidade, qtd: 0, votos: 0, meta: 0 };
      cidadesMap[cidade].qtd += 1;
      cidadesMap[cidade].votos += Number(l.atuais) || 0;
      cidadesMap[cidade].meta += metaLideranca(l);
    });
    const cidades = Object.values(cidadesMap).sort((a, b) => b.qtd - a.qtd);
    return { ...r, qtd: itens.length, votos: itens.reduce((s, l) => s + (Number(l.atuais) || 0), 0), meta: itens.reduce((s, l) => s + metaLideranca(l), 0), cidades };
  });

  const regionalInicial = listaRegionais(mapaAtivo)[0] || regionais[0];
  const dadosFormulario = editando || {
    id: '', nome: '', local: '', mapa: tempLatLngRef.current?.mapa || mapaAtivo, regional: regionalInicial?.codigo || '',
    lat: tempLatLngRef.current?.lat || regionalInicial?.lat || 0, lng: tempLatLngRef.current?.lng || regionalInicial?.lng || 0,
    fel: 1, meta_votos: '', atuais: 0, whatsapp: '', responsavel: '', observacao: '', categoria: 'vermelho-politicos'
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
          <div className="regional-buttons"><button className={!regionalAtiva ? 'active' : ''} onClick={() => { setRegionalAtiva(''); setCidadeAtiva(''); setRegionalExpandida(''); }}>Todas</button>{listaRegionais(mapaAtivo).map((r) => <button key={r.id} className={regionalAtiva === r.codigo ? 'active' : ''} onClick={() => { setRegionalAtiva(r.codigo); setCidadeAtiva(''); setRegionalExpandida(''); }}>{r.nome}</button>)}</div>
          <div className="pin-legend">{CATEGORIAS_PIN.map((c) => <span key={c.codigo}><i style={{ background: c.cor, borderColor: c.codigo === 'branco-empresarios' ? '#111827' : 'transparent' }} />{c.corNome}: {c.nomeCurto}</span>)}</div>

          <div className="board" style={{ display: mapaAtivo === 'curitiba' ? 'flex' : 'none' }}><div className="board-head"><h2>Mapa de Lideranças — Curitiba</h2><span>clique no mapa para cadastrar</span></div><div id="map-curitiba" className="mapa"></div></div>
          <div className="board" style={{ display: mapaAtivo === 'parana' ? 'flex' : 'none' }}><div className="board-head"><h2>Mapa de Lideranças — Paraná</h2><span>clique no mapa para cadastrar</span></div><div id="map-parana" className="mapa"></div></div>

          <div className="resumo-regionais">{resumoRegionais.map((r) => {
            const podeAbrirCidades = mapaAtivo === 'parana' && r.cidades.length > 0;
            const expandido = regionalExpandida === r.codigo;
            const focarLista = () => sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return (
              <div key={r.id} className={`mini-card-wrap ${expandido ? 'expandido' : ''}`}>
                <button
                  type="button"
                  className={`mini-card ${regionalAtiva === r.codigo && !cidadeAtiva ? 'active' : ''}`}
                  onClick={() => {
                    setRegionalAtiva(r.codigo);
                    setCidadeAtiva('');
                    if (podeAbrirCidades) {
                      setRegionalExpandida(expandido ? '' : r.codigo);
                    } else {
                      setRegionalExpandida('');
                      focarLista();
                    }
                  }}
                >
                  <b>{r.nome}{podeAbrirCidades ? (expandido ? ' ▲' : ' ▼') : ''}</b>
                  <span>{r.qtd} lideranças · {r.votos.toLocaleString('pt-BR')} votos · meta {r.meta.toLocaleString('pt-BR')}</span>
                </button>
                {podeAbrirCidades && expandido && (
                  <div className="mini-card-cidades">
                    {r.cidades.map((c) => (
                      <button
                        type="button"
                        key={c.cidade}
                        className={regionalAtiva === r.codigo && cidadeAtiva === c.cidade ? 'active' : ''}
                        onClick={() => { setRegionalAtiva(r.codigo); setCidadeAtiva(c.cidade); focarLista(); }}
                      >
                        {c.cidade} · {c.qtd}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}</div>
        </div>

        <aside className="sidebar" ref={sidebarRef}>
          <h3>Lideranças cadastradas</h3>
          {cidadeAtiva && (
            <div className="filtro-cidade-ativo">
              Filtrando por cidade: <b>{cidadeAtiva}</b>
              <button type="button" onClick={() => setCidadeAtiva('')}>limpar</button>
            </div>
          )}
          <input className="input-full" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="buscar nome, bairro ou responsável..." />
          <select className="input-full" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}><option value="">Todos os status</option><option value="sem-votos">Sem votos</option><option value="abaixo-25">Abaixo de 25%</option><option value="em-andamento">Em andamento</option><option value="perto-meta">Perto da meta</option><option value="meta-batida">Meta batida</option></select>

          <div className="lideranca-list">
            {carregando && <p className="empty">Carregando dados...</p>}
            {!carregando && itensFiltrados.length === 0 && <p className="empty">Nenhuma liderança encontrada.</p>}
            {itensFiltrados.map((l) => {
              const meta = metaLideranca(l);
              const pct = meta > 0 ? Math.min(100, Math.round(((Number(l.atuais) || 0) / meta) * 100)) : 0;
              const cat = categoriaInfo(l.categoria);
              return (
                <button key={l.id} className="l-card" style={{ borderLeftColor: cat.cor }} onClick={() => {
                  const mapObj = l.mapa === 'curitiba' ? mapCuritibaRef.current : mapParanaRef.current;
                  const marker = markersRef.current[l.mapa]?.[l.id];
                  if (mapObj && marker) {
                    setMapaAtivo(l.mapa);
                    setTimeout(() => {
                      mapObj.invalidateSize();
                      mapObj.setView(marker.getLatLng(), l.mapa === 'curitiba' ? 14 : 8, { animate: true });
                      marker.openPopup();
                    }, 120);
                  }
                  setEditando(l);
                }}>
                  <div><b>{l.nome}</b><span>{meta.toLocaleString('pt-BR')}</span></div>
                  <small>{l.local} · {regionalInfo(l.mapa, l.regional)?.nome || ''}</small>
                  <small className="card-cat"><em style={{ background: cat.cor, borderColor: corPinBorda(cat) }} />{cat.corNome}: {cat.nomeCurto}</small>
                  <i><em style={{ width: `${pct}%` }} /></i>
                </button>
              );
            })}
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
            <Field label="Bairro / cidade">
              <input
                name="local"
                ref={localInputRef}
                defaultValue={dadosFormulario.local}
                onBlur={(e) => {
                  const valor = e.target.value.trim();
                  if (valor && valor !== localOriginalRef.current.trim()) {
                    geocodificarEndereco(valor);
                  }
                }}
              />
            </Field>
            <div className="geocode-row">
              <button type="button" className="btn ghost small" disabled={geocodando} onClick={() => geocodificarEndereco(localInputRef.current?.value)}>
                {geocodando ? 'Localizando...' : '📍 Localizar no mapa automaticamente'}
              </button>
              {geocodeMsg && <small className="geocode-msg">{geocodeMsg}</small>}
            </div>
            <Field label="Categoria / cor do pin"><select name="categoria" defaultValue={dadosFormulario.categoria || 'vermelho-politicos'}>{CATEGORIAS_PIN.map((c) => <option key={c.codigo} value={c.codigo}>{c.corNome} — {c.nome}</option>)}</select></Field>
            <div className="grid-2"><Field label="Mapa"><select name="mapa" value={formMapa} onChange={(e) => setFormMapa(e.target.value)}><option value="curitiba">Curitiba</option><option value="parana">Paraná</option></select></Field><Field label="Regional"><select name="regional" key={formMapa} defaultValue={formMapa === dadosFormulario.mapa ? dadosFormulario.regional : ''}>{listaRegionais(formMapa).map((r) => <option key={r.id} value={r.codigo}>{r.nome}</option>)}</select></Field></div>
            <div className="grid-2"><Field label="Latitude"><input name="lat" ref={latInputRef} defaultValue={dadosFormulario.lat} /></Field><Field label="Longitude"><input name="lng" ref={lngInputRef} defaultValue={dadosFormulario.lng} /></Field></div>
            <input type="hidden" name="fel" value={dadosFormulario.fel || 1} />
            <div className="grid-2"><Field label="Meta manual de votos previstos"><input name="meta_votos" type="number" min="0" defaultValue={dadosFormulario.meta_votos || metaLideranca(dadosFormulario)} required /></Field><Field label="Votos alcançados"><input name="atuais" type="number" min="0" defaultValue={dadosFormulario.atuais} /></Field></div>
            <Field label="WhatsApp"><input name="whatsapp" defaultValue={formatarWhatsApp(dadosFormulario.whatsapp)} placeholder="(41) 99999-9999" inputMode="numeric" maxLength="15" onInput={(e) => { e.currentTarget.value = formatarWhatsApp(e.currentTarget.value); }} /></Field>
            <Field label="Responsável"><input name="responsavel" defaultValue={dadosFormulario.responsavel} /></Field>
            <Field label="Observação"><textarea name="observacao" defaultValue={dadosFormulario.observacao} /></Field>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => { setFormAberto(false); setEditando(null); }}>Voltar</button>
              {editando && <button type="button" className="btn danger" onClick={() => excluirLideranca(editando.id)}>Excluir</button>}
              <button type="button" className="btn ghost" onClick={() => { setFormAberto(false); setEditando(null); }}>Cancelar</button>
              <button className="btn" type="submit">Salvar</button>
            </div>
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

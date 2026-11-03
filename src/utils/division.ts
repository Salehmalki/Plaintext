/**
 * Long Division Logic & Types (القسمة المطولة خطوة بخطوة)
 */

export const EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export const PLACE_NAMES = [
  'الآحاد',
  'العشرات',
  'المئات',
  'الآلاف',
  'عشرات الآلاف',
  'مئات الآلاف',
  'الملايين',
  'عشرات الملايين',
  'مئات الملايين',
];

export function formatDigits(val: string | number, isEastern: boolean): string {
  const s = String(val);
  if (!isEastern) {
    return s.replace(/[٠-٩]/g, (d) => String(EASTERN_DIGITS.indexOf(d)));
  }
  return s.replace(/[0-9]/g, (d) => EASTERN_DIGITS[Number(d)]);
}

export function normalizeDigits(val: string | number): string {
  return String(val)
    .replace(/[٠-٩]/g, (d) => String(EASTERN_DIGITS.indexOf(d)))
    .replace(/\D/g, '');
}

export interface SubResult {
  lines: string[];
  overs: Record<number, number>;
  any: boolean;
}

export interface Block {
  e: number; // dividend index
  W: number; // current window number
  q: number; // quotient digit
  P: number; // product q * D
  R: number; // remainder W - P
  d: number; // current brought-down digit
}

export type StepType = 'pick' | 'down' | 'div' | 'mul' | 'sub' | 'end';

export interface DivisionStep {
  id: number;
  t: StepType;
  b: Block;
  sub?: SubResult;
}

export interface DivisionData {
  dg: number[];
  n: number;
  N: number;
  D: number;
  blocks: Block[];
  S: DivisionStep[];
  Q: string;
  R: number;
}

export const STEP_LABELS: Record<StepType, string> = {
  pick: 'ابدأ',
  down: 'أنزل',
  div: 'اقسم',
  mul: 'اضرب',
  sub: 'اطرح',
  end: 'النتيجة',
};

export const STEP_DESCRIPTIONS: Record<StepType, string> = {
  pick: 'تحديد أول أرقام المقسوم للبدء بالعملية',
  down: 'إنزال الرقم التالي من المقسوم بجانب الباقي',
  div: 'قسمة العدد الحالي على المقسوم عليه وكتابة الناتج',
  mul: 'ضرب رقم الناتج في المقسوم عليه',
  sub: 'طرح حاصل الضرب من العدد وتحديد الباقي',
  end: 'التحقق من صحة ناتج القسمة والباقي النهائي',
};

export function calculateSubtraction(W: number, P: number, isEastern: boolean): SubResult {
  const w = String(W).split('').reverse().map(Number);
  const p = String(P).split('').reverse().map(Number);
  let bi = 0;
  let any = false;
  const lines: string[] = [];
  const overs: Record<number, number> = {};

  for (let i = 0; i < w.length; i++) {
    const tp = w[i];
    const pd = p[i] || 0;
    const eff = tp - bi;
    const bo = eff < pd ? 1 : 0;
    const top = eff + 10 * bo;
    const nm = PLACE_NAMES[i] || `الخانة ${i + 1}`;

    if (i >= p.length && !bi && !bo) break;

    const effF = formatDigits(eff, isEastern);
    const pdF = formatDigits(pd, isEastern);
    const topF = formatDigits(top, isEastern);
    const diffF = formatDigits(top - pd, isEastern);
    const tpF = formatDigits(tp, isEastern);
    const oneF = formatDigits(1, isEastern);
    const zeroF = formatDigits(0, isEastern);
    const tenF = formatDigits(10, isEastern);

    let s = '';
    if (bo) {
      any = true;
      if (eff < 0) {
        s = `${nm}: فيها ${zeroF} وقد استلفت منها الخانة السابقة، فنستلف ${oneF} من الخانة التي بعدها فتصير ${tenF} ثم تعطي ${oneF} فيبقى ${topF}، (${topF} − ${pdF} = ${diffF})`;
      } else {
        s = `${nm}: ${effF} أصغر من ${pdF}، فنستلف ${oneF} من الخانة التي بعدها فيصبح ${topF}، (${topF} − ${pdF} = ${diffF})`;
      }
    } else if (bi) {
      s = `${nm}: كان فيها ${tpF} وأعطت ${oneF} للخانة السابقة فبقي ${effF}، (${effF} − ${pdF} = ${formatDigits(eff - pd, isEastern)})`;
    } else {
      s = `${nm}: (${tpF} − ${pdF} = ${formatDigits(tp - pd, isEastern)})`;
    }

    if (top !== tp) {
      overs[i] = top;
    }
    lines.push(s);
    bi = bo;
  }

  return { lines, overs, any };
}

export function buildDivision(dividendStr: string, divisor: number, isEastern = true): DivisionData {
  const normDividend = normalizeDigits(dividendStr);
  const dg = normDividend.split('').map(Number);
  const n = dg.length;
  const N = Number(normDividend);
  const D = divisor;

  let k = 0;
  let W = 0;
  while (k < n) {
    W = W * 10 + dg[k];
    k++;
    if (W >= D) break;
  }

  const blocks: Block[] = [];
  let cur = W;
  let e = k - 1;

  while (true) {
    const q = Math.floor(cur / D);
    const P = q * D;
    const R = cur - P;
    blocks.push({ e, W: cur, q, P, R, d: dg[e] });
    if (e === n - 1) break;
    e++;
    cur = R * 10 + dg[e];
  }

  const S: DivisionStep[] = [];
  let stepId = 0;
  blocks.forEach((b, i) => {
    S.push({ id: stepId++, t: i ? 'down' : 'pick', b });
    S.push({ id: stepId++, t: 'div', b });
    if (b.q > 0) {
      S.push({ id: stepId++, t: 'mul', b });
      S.push({
        id: stepId++,
        t: 'sub',
        b,
        sub: calculateSubtraction(b.W, b.P, isEastern),
      });
    }
  });

  S.push({ id: stepId++, t: 'end', b: blocks[blocks.length - 1] });

  // Quotient string: for blocks where q was calculated
  // If first block was smaller than D, handle properly
  const quotientStr = blocks.map((b) => b.q).join('');

  return {
    dg,
    n,
    N,
    D,
    blocks,
    S,
    Q: quotientStr,
    R: blocks[blocks.length - 1].R,
  };
}

export interface BoardCell {
  ch: number | string;
  cls: string;
  over?: number | string;
}

export interface BoardRow {
  cells: Record<number, BoardCell>;
  cls?: string;
  minus?: number;
  ln?: number;
  dv?: number;
}

export function generateBoardState(
  data: DivisionData,
  currentStepIndex: number,
  isEastern: boolean
) {
  const n = data.n;
  const D = data.D;

  const dr: BoardRow = { cells: {}, cls: 'dvd', dv: 1 };
  data.dg.forEach((d, c) => {
    dr.cells[c] = { ch: formatDigits(d, isEastern), cls: '' };
  });

  const rows: BoardRow[] = [dr];
  const q: Record<number, BoardCell> = {};
  let cur = dr;
  let used = -1;

  for (let i = 0; i <= currentStepIndex; i++) {
    const s = data.S[i];
    const b = s.b;
    const isNew = i === currentStepIndex ? ' new' : '';

    if (s.t === 'pick') {
      used = b.e;
    } else if (s.t === 'down') {
      used = b.e;
      cur.cells[b.e] = {
        ch: formatDigits(b.d, isEastern),
        cls: 'down' + isNew,
      };
    } else if (s.t === 'div') {
      q[b.e] = {
        ch: formatDigits(b.q, isEastern),
        cls: isNew,
      };
    } else if (s.t === 'mul') {
      const r: BoardRow = { cells: {}, minus: 1, ln: 1 };
      const a = String(b.P).split('');
      a.forEach((ch, j) => {
        r.cells[b.e - a.length + 1 + j] = {
          ch: formatDigits(ch, isEastern),
          cls: isNew,
        };
      });
      rows.push(r);
    } else if (s.t === 'sub') {
      const subRes = calculateSubtraction(b.W, b.P, isEastern);
      for (const k in subRes.overs) {
        const colIdx = b.e - Number(k);
        const cell = cur.cells[colIdx];
        if (cell) {
          cell.over = formatDigits(subRes.overs[k], isEastern);
          cell.cls += ' ov';
        }
      }
      const isLastBlock = b === data.blocks[data.blocks.length - 1];
      const r: BoardRow = { cells: {} };
      const a = String(b.R).split('');
      a.forEach((ch, j) => {
        r.cells[b.e - a.length + 1 + j] = {
          ch: formatDigits(ch, isEastern),
          cls: (isLastBlock ? 'rem-final ' : '') + isNew,
        };
      });
      rows.push(r);
      cur = r;
    }
  }

  // If we are at the final 'end' step, ensure the bottom remainder row is highlighted
  if (currentStepIndex === data.S.length - 1 && rows.length > 1) {
    const lastRow = rows[rows.length - 1];
    for (const col in lastRow.cells) {
      const cell = lastRow.cells[col];
      if (!cell.cls.includes('rem-final')) {
        cell.cls = ('rem-final ' + cell.cls).trim();
      }
    }
  }

  const g = Math.max(2, String(D).length + 1);

  return {
    n,
    g,
    DFormatted: formatDigits(D, isEastern),
    qRow: { cells: q } as BoardRow,
    rows,
    used,
  };
}

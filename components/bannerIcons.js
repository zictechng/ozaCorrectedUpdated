
import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  Rect,
  Path,
  Polygon,
  Line,
  Text as SvgText,
} from 'react-native-svg';

// ── Buy & Sell Banner Icon ─────────────────────────
export const BuySellIcon = () => (
  <Svg width="105" height="105" viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="55" fill="rgba(255,255,255,0.12)" />
    <Ellipse cx="60" cy="85" rx="30" ry="8" fill="rgba(255,255,255,0.15)" />
    <Ellipse cx="60" cy="78" rx="30" ry="8" fill="rgba(255,255,255,0.20)" />
    <Ellipse cx="60" cy="71" rx="30" ry="8" fill="rgba(255,255,255,0.25)" />
    <Ellipse cx="60" cy="63" rx="30" ry="8" fill="rgba(255,255,255,0.9)" />
    <Ellipse cx="60" cy="63" rx="22" ry="5.5" fill="rgba(255,255,255,0.3)" />
    <SvgText
      x="60"
      y="66"
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill="rgba(76,95,213,0.9)">
      $
    </SvgText>
    <Polygon
      points="38,50 44,58 41,58 41,68 35,68 35,58 32,58"
      fill="rgba(255,255,255,0.9)"
    />
    <Polygon
      points="82,68 76,60 79,60 79,50 85,50 85,60 88,60"
      fill="rgba(255,255,255,0.7)"
    />
    <Circle cx="25" cy="30" r="3" fill="rgba(255,255,255,0.6)" />
    <Circle cx="95" cy="35" r="2" fill="rgba(255,255,255,0.5)" />
    <Circle cx="90" cy="85" r="2.5" fill="rgba(255,255,255,0.4)" />
  </Svg>
);

// ── Electricity Banner Icon ────────────────────────
export const ElectricityIcon = () => (
  <Svg width="105" height="105" viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="50" fill="rgba(255,255,255,0.10)" />
    <Circle cx="60" cy="60" r="38" fill="rgba(255,255,255,0.08)" />
    <Path
      d="M60 25 C42 25 30 37 30 52 C30 63 37 72 47 77 L47 88 L73 88 L73 77 C83 72 90 63 90 52 C90 37 78 25 60 25Z"
      fill="rgba(255,255,255,0.85)"
    />
    <Path
      d="M48 38 C48 38 52 32 60 31"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <Rect x="47" y="88" width="26" height="5" rx="2" fill="rgba(255,255,255,0.7)" />
    <Rect x="49" y="95" width="22" height="5" rx="2" fill="rgba(255,255,255,0.6)" />
    <Rect x="51" y="102" width="18" height="5" rx="2" fill="rgba(255,255,255,0.5)" />
    <Polygon
      points="65,42 55,58 62,58 55,75 70,55 63,55"
      fill="rgba(0,200,150,0.9)"
    />
    <Circle cx="20" cy="40" r="3" fill="rgba(255,255,255,0.5)" />
    <Circle cx="100" cy="45" r="2.5" fill="rgba(255,255,255,0.4)" />
    <Line
      x1="18" y1="55" x2="24" y2="55"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="21" y1="52" x2="21" y2="58"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="98" y1="60" x2="104" y2="60"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="101" y1="57" x2="101" y2="63"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// ── TV Subscription Banner Icon ────────────────────
export const TVIcon = () => (
  <Svg width="105" height="105" viewBox="0 0 120 120">
    <Circle cx="60" cy="55" r="48" fill="rgba(255,255,255,0.08)" />
    <Rect x="18" y="25" width="84" height="58" rx="8" fill="rgba(255,255,255,0.85)" />
    <Rect x="24" y="31" width="72" height="46" rx="5" fill="rgba(109,40,217,0.8)" />
    <Circle cx="60" cy="54" r="14" fill="rgba(255,255,255,0.25)" />
    <Polygon points="55,47 55,61 70,54" fill="rgba(255,255,255,0.95)" />
    <Path
      d="M26 33 L58 33 L52 38 L26 38Z"
      fill="rgba(255,255,255,0.15)"
    />
    <Rect x="52" y="83" width="16" height="10" rx="2" fill="rgba(255,255,255,0.7)" />
    <Rect x="40" y="93" width="40" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
    <Path
      d="M88 20 C92 24 92 30 88 34"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M93 16 C99 22 99 32 93 38"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M98 12 C106 20 106 34 98 42"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx="15" cy="30" r="2.5" fill="rgba(255,255,255,0.5)" />
    <Circle cx="12" cy="70" r="2" fill="rgba(255,255,255,0.4)" />
  </Svg>
);

// ── Exam Card Banner Icon ──────────────────────────
export const ExamCardIcon = () => (
  <Svg width="105" height="105" viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="52" fill="rgba(255,255,255,0.08)" />
    <Rect
      x="28" y="35" width="68" height="52" rx="7"
      fill="rgba(255,255,255,0.3)"
      transform="rotate(-6, 60, 60)"
    />
    <Rect x="22" y="32" width="68" height="52" rx="7" fill="rgba(255,255,255,0.92)" />
    <Rect x="22" y="32" width="68" height="16" rx="7" fill="rgba(245,158,11,0.85)" />
    <Rect x="22" y="40" width="68" height="8" fill="rgba(245,158,11,0.85)" />
    <SvgText
      x="56"
      y="44"
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="white">
      EXAM CARD
    </SvgText>
    <Rect
      x="30" y="54" width="52" height="14" rx="4"
      fill="rgba(245,158,11,0.15)"
      stroke="rgba(245,158,11,0.4)"
      strokeWidth="1"
      strokeDasharray="3,2"
    />
    <SvgText
      x="56"
      y="64"
      textAnchor="middle"
      fontSize="7"
      fill="rgba(245,158,11,0.8)">
      ● ● ● ● ● ● ● ●
    </SvgText>
    <Line
      x1="30" y1="76" x2="82" y2="76"
      stroke="rgba(0,0,0,0.12)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Line
      x1="30" y1="82" x2="65" y2="82"
      stroke="rgba(0,0,0,0.08)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Polygon points="60,18 45,26 60,34 75,26" fill="rgba(255,255,255,0.9)" />
    <Rect x="71" y="26" width="2.5" height="10" rx="1" fill="rgba(255,255,255,0.7)" />
    <Circle cx="72" cy="37" r="3" fill="rgba(255,255,255,0.8)" />
    <Circle cx="18" cy="55" r="2.5" fill="rgba(255,255,255,0.6)" />
    <Circle cx="105" cy="40" r="2" fill="rgba(255,255,255,0.5)" />
    <Circle cx="100" cy="75" r="3" fill="rgba(255,255,255,0.4)" />
  </Svg>
);

// ── Rewards Banner Icon ────────────────────────────
export const RewardsIcon = () => (
  <Svg width="105" height="105" viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="52" fill="rgba(255,255,255,0.08)" />
    <Circle cx="60" cy="60" r="36" fill="rgba(255,255,255,0.06)" />
    <Rect x="25" y="62" width="70" height="42" rx="6" fill="rgba(255,255,255,0.85)" />
    <Rect x="20" y="50" width="80" height="16" rx="5" fill="rgba(255,255,255,0.95)" />
    <Rect x="55" y="50" width="10" height="54" rx="2" fill="rgba(239,68,68,0.7)" />
    <Rect x="20" y="55" width="80" height="6" rx="2" fill="rgba(239,68,68,0.7)" />
    <Ellipse
      cx="48" cy="44" rx="12" ry="8"
      fill="rgba(239,68,68,0.8)"
      transform="rotate(-20, 48, 44)"
    />
    <Ellipse
      cx="48" cy="44" rx="8" ry="5"
      fill="rgba(239,68,68,0.4)"
      transform="rotate(-20, 48, 44)"
    />
    <Ellipse
      cx="72" cy="44" rx="12" ry="8"
      fill="rgba(239,68,68,0.8)"
      transform="rotate(20, 72, 44)"
    />
    <Ellipse
      cx="72" cy="44" rx="8" ry="5"
      fill="rgba(239,68,68,0.4)"
      transform="rotate(20, 72, 44)"
    />
    <Circle cx="60" cy="50" r="6" fill="rgba(220,38,38,0.9)" />
    <Polygon
      points="20,28 22,34 28,34 23,38 25,44 20,40 15,44 17,38 12,34 18,34"
      fill="rgba(255,255,255,0.8)"
    />
    <Polygon
      points="98,20 99.5,25 105,25 100.5,28 102,33 98,30 94,33 95.5,28 91,25 96.5,25"
      fill="rgba(255,255,255,0.6)"
    />
    <Circle cx="100" cy="70" r="3" fill="rgba(255,255,255,0.5)" />
    <Circle cx="15" cy="75" r="2.5" fill="rgba(255,255,255,0.4)" />
  </Svg>
);
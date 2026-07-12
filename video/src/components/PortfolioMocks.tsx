import React from 'react';
import { theme } from '../theme';

const sans = theme.sans;

const Frame: React.FC<{ bg: string; children: React.ReactNode }> = ({
  bg,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: bg,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const Instagram: React.FC<{ accent: string }> = ({ accent }) => (
  <Frame bg={`linear-gradient(160deg, ${accent}, #2a1040)`}>
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        display: 'flex',
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
          }}
        />
      ))}
    </div>
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #ff2d87, #a855f7, #ff2d87)',
          padding: 2,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#2a1040',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            width: 60,
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.85)',
          }}
        />
        <div
          style={{
            width: 38,
            height: 5,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.5)',
          }}
        />
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        top: '46%',
        left: '50%',
        transform: 'translate(-50%,-50%) rotate(-6deg)',
        background: '#fff',
        color: '#2a1040',
        fontWeight: 800,
        fontSize: 15,
        padding: '8px 14px',
        borderRadius: 10,
        fontFamily: sans,
      }}
    >
      made with ✨
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        height: 30,
        borderRadius: 16,
        border: '1.5px solid rgba(255,255,255,0.6)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontFamily: sans,
      }}
    >
      Send message
    </div>
  </Frame>
);

const Canva: React.FC<{ accent: string }> = ({ accent }) => (
  <Frame bg="#eef0f6">
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 16,
        background: '#fff',
        borderBottom: '1px solid #e2e4ee',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 0,
        bottom: 0,
        width: 22,
        background: '#20123a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 10,
        gap: 9,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 11,
            height: 11,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.5)',
          }}
        />
      ))}
    </div>
    <div
      style={{ position: 'absolute', top: 16, left: 22, right: 0, bottom: 0 }}
    >
      <div
        style={{
          position: 'absolute',
          left: '20%',
          top: '18%',
          width: '34%',
          height: '26%',
          borderRadius: 8,
          background: accent,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '14%',
          top: '14%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#ff2d87',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '18%',
          bottom: '20%',
          width: '54%',
        }}
      >
        <div
          style={{
            border: `1.5px dashed ${accent}`,
            borderRadius: 6,
            padding: '9px 10px',
            color: '#20123a',
            fontWeight: 800,
            fontSize: 13,
            fontFamily: sans,
            background: 'rgba(255,255,255,0.75)',
          }}
        >
          Your design
        </div>
        {[
          [-3, -3],
          ['calc(100% - 3px)', -3],
          [-3, 'calc(100% - 3px)'],
          ['calc(100% - 3px)', 'calc(100% - 3px)'],
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c[0] as number,
              top: c[1] as number,
              width: 6,
              height: 6,
              background: '#fff',
              border: `1.5px solid ${accent}`,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  </Frame>
);

const GPay: React.FC<{ accent: string }> = ({ accent }) => (
  <Frame bg={`linear-gradient(160deg, ${accent}, #05493a)`}>
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: sans,
      }}
    >
      Scratch &amp; win
    </div>
    <div
      style={{
        position: 'absolute',
        top: '52%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '64%',
        aspectRatio: '1 / 1',
        borderRadius: 14,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      }}
    >
      <div
        style={{
          color: '#05493a',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: sans,
        }}
      >
        You won
      </div>
      <div
        style={{
          color: '#05493a',
          fontSize: 26,
          fontWeight: 800,
          fontFamily: sans,
        }}
      >
        ₹500
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        top: '52%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '64%',
        aspectRatio: '1 / 1',
        borderRadius: 14,
        background: 'linear-gradient(135deg, #cbd0d8, #9aa1ad)',
        clipPath: 'polygon(0 0, 100% 0, 100% 58%, 52% 76%, 68% 100%, 0 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '26%',
      }}
    >
      <div
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: sans,
        }}
      >
        Scratch here
      </div>
    </div>
  </Frame>
);

const Snapseed: React.FC<{ accent: string }> = ({ accent }) => (
  <Frame bg={`linear-gradient(160deg, ${accent}, #3a2600)`}>
    <div style={{ position: 'absolute', left: 12, right: 12, bottom: 46 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 10,
          fontWeight: 600,
          fontFamily: sans,
          marginBottom: 6,
        }}
      >
        <span>Brightness</span>
        <span>+35</span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.3)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '62%',
            borderRadius: 2,
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '62%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 10,
        display: 'flex',
        gap: 6,
      }}
    >
      {['#ffd6a5', '#a5d8ff', '#caffbf', '#ffadad', '#bdb2ff'].map((c, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            aspectRatio: '1 / 1',
            borderRadius: 6,
            background: c,
            opacity: 0.92,
          }}
        />
      ))}
    </div>
  </Frame>
);

const ReactFlowMock: React.FC<{ accent: string }> = ({ accent }) => {
  const node = (left: string, top: string, dot: string) => (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: '34%',
        padding: '6px 8px',
        borderRadius: 7,
        background: '#fff',
        boxShadow: '0 4px 14px rgba(20,12,40,0.14)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{ width: 8, height: 8, borderRadius: '50%', background: dot }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: '#d7dae4',
            marginBottom: 3,
          }}
        />
        <div
          style={{
            height: 4,
            width: '60%',
            borderRadius: 2,
            background: '#e6e8f0',
          }}
        />
      </div>
    </div>
  );
  return (
    <Frame bg="#f7f8fb">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, #d6d9e4 1.2px, transparent 1.2px)',
          backgroundSize: '14px 14px',
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <path
          d="M30 34 C 48 34, 46 30, 60 26"
          fill="none"
          stroke={accent}
          strokeWidth="1.1"
        />
        <path
          d="M30 40 C 48 40, 48 64, 60 66"
          fill="none"
          stroke={accent}
          strokeWidth="1.1"
        />
      </svg>
      {node('8%', '28%', accent)}
      {node('58%', '18%', '#ff2d87')}
      {node('58%', '58%', '#8a2be2')}
    </Frame>
  );
};

const PhotoEditor: React.FC<{ accent: string }> = ({ accent }) => (
  <Frame bg={`linear-gradient(160deg, ${accent}, #3a0025)`}>
    <div
      style={{
        position: 'absolute',
        inset: '15%',
        border: '1.5px solid rgba(255,255,255,0.9)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '33.33%',
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(255,255,255,0.45)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '66.66%',
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(255,255,255,0.45)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '33.33%',
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(255,255,255,0.45)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '66.66%',
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(255,255,255,0.45)',
        }}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.55)',
          }}
        />
      ))}
    </div>
  </Frame>
);

const MOCKS: Record<string, React.FC<{ accent: string }>> = {
  instagram: Instagram,
  canva: Canva,
  gpay: GPay,
  snapseed: Snapseed,
  reactflow: ReactFlowMock,
  photo: PhotoEditor,
};

export const PortfolioMock: React.FC<{ id: string; accent: string }> = ({
  id,
  accent,
}) => {
  const Mock = MOCKS[id];
  return Mock ? <Mock accent={accent} /> : null;
};

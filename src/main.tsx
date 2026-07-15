import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PetX } from '@petx/react';
import '@petx/react/styles.css';
import './styles.css';

type Pet = {
  id: string;
  displayName: string;
  description: string;
  spriteVersionNumber: 2;
  spritesheetPath: string;
  manifestPath: string;
  downloadPath: string;
};

const animationRows = [
  { label: 'Idle', animation: 'idle' },
  { label: 'Run', animation: 'runningRight' },
  { label: 'Wave', animation: 'waving' },
  { label: 'Review', animation: 'review' },
];

function SpritePreview({ pet, animation = 'idle' }: { pet: Pet; animation?: string }) {
  return (
    <div className="sprite-shell">
      <PetX
        pet={pet}
        src={pet.spritesheetPath}
        animation={animation}
        size={192}
        className="character-sprite"
        title={`${pet.displayName} desktop character`}
      />
    </div>
  );
}

function PetCard({ pet, onSelect }: { pet: Pet; onSelect: (pet: Pet) => void }) {
  return (
    <article className="pet-card">
      <button className="pet-preview-button" onClick={() => onSelect(pet)} aria-label={`查看 ${pet.displayName}`}>
        <SpritePreview pet={pet} />
      </button>
      <div className="pet-card-body">
        <div>
          <h2>{pet.displayName}</h2>
          <p>{pet.description}</p>
        </div>
        <div className="pet-card-actions">
          <button className="secondary-button" onClick={() => onSelect(pet)}>
            详情
          </button>
          <a className="primary-button" href={pet.downloadPath} download>
            下载 zip
          </a>
        </div>
      </div>
    </article>
  );
}

function PetDetail({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const [animation, setAnimation] = useState('idle');

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="pet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close-button" onClick={onClose} aria-label="关闭详情">
          ×
        </button>
        <div className="modal-preview">
          <SpritePreview pet={pet} animation={animation} />
        </div>
        <div className="modal-content">
          <p className="pet-id">{pet.id}</p>
          <h2 id="pet-detail-title">{pet.displayName}</h2>
          <p>{pet.description}</p>
          <div className="row-tabs" aria-label="动画预览">
            {animationRows.map((item) => (
              <button
                key={item.label}
                className={animation === item.animation ? 'active' : ''}
                onClick={() => setAnimation(item.animation)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="install-box">
          <h3>如何安装</h3>
          <p>下载 zip，解压后把里面的文件夹放到 ~/.codex/pets/，再重启 Codex。</p>
          </div>
          <div className="modal-actions">
            <a className="primary-button" href={pet.downloadPath} download>
              下载完整 zip
            </a>
            <a className="secondary-button" href={pet.manifestPath} target="_blank" rel="noreferrer">
              查看 manifest
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [query, setQuery] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/pets.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load character manifest.');
        }
        return response.json() as Promise<Pet[]>;
      })
      .then(setPets)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  const filteredPets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return pets;
    }

    return pets.filter((pet) =>
      [pet.id, pet.displayName, pet.description].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [pets, query]);

  return (
    <main className="page">
      <header className="site-header">
        <div>
          <h1>Codex 桌面人物</h1>
          <p>我的 Codex 桌面人物展馆。每个角色都可以预览动画，也可以下载完整安装包。</p>
        </div>
        <div className="stats" aria-label="桌面人物数量">
          <strong>{pets.length}</strong>
          <span>人物</span>
        </div>
      </header>

      <section className="toolbar" aria-label="桌面人物搜索">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索名字、id 或描述"
        />
        <span>{filteredPets.length} 个结果</span>
      </section>

      {error ? <p className="error-message">{error}</p> : null}

      <section className="pet-grid" aria-label="桌面人物列表">
        {filteredPets.map((pet) => (
          <PetCard key={pet.id} pet={pet} onSelect={setSelectedPet} />
        ))}
      </section>

      {!error && filteredPets.length === 0 ? (
        <section className="empty-state">
          <h2>没有找到桌面人物</h2>
          <p>换个关键词试试。</p>
        </section>
      ) : null}

      <section className="install-guide" aria-labelledby="install-title">
        <h2 id="install-title">安装方式</h2>
        <p>下载某个桌面人物的 zip，解压后把文件夹放到 ~/.codex/pets/，再重启 Codex 就可以选择它。</p>
        <code>~/.codex/pets/&lt;character-id&gt;/pet.json</code>
        <code>~/.codex/pets/&lt;character-id&gt;/spritesheet.webp</code>
      </section>

      {selectedPet ? <PetDetail pet={selectedPet} onClose={() => setSelectedPet(null)} /> : null}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

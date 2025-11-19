import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Search, User, FileText, Network } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';
import styles from './Sidebar.module.css';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.CHAT, label: 'Chat', icon: MessageSquare },
  { path: ROUTES.QUERY, label: 'Query', icon: Search },
  { path: ROUTES.INGESTION, label: 'Ingestion', icon: FileText },
  { path: ROUTES.KNOWLEDGE, label: 'Knowledge Graph', icon: Network },
  { path: ROUTES.PROFILE, label: 'Profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${styles.link} ${isActive ? styles['link--active'] : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} className={styles.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};


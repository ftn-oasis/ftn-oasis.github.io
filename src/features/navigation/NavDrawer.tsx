import {
  IconBook2,
  IconBuilding,
  IconBuildingEstate,
  IconCalendarTime,
  IconFileAlert,
  IconFileText,
  IconFileTextSpark,
  IconHome,
  IconMessageReport,
  IconPackage,
  IconPrinter,
  IconReceiptYen,
  IconX,
} from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import { Avater } from "@src/components/ui/Avatar";
import { Divider } from "@src/components/ui/Divider";
import { Emblem } from "@src/components/ui/Emblem";
import { Icon } from "@src/components/ui/Icon";
import { useEscapeKey } from "@src/components/ui/useEscapeKey";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MenuLink } from "@src/components/ui/MenuLink";
import {
  getDocumentsEditedByCurrentUser,
  MOCK_ORGANIZATION,
} from "@src/features/organization/mockData";

import styles from "./NavDrawer.module.css";

type NavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function NavDrawer({ open, onClose }: NavDrawerProps) {
  useEscapeKey(open, onClose);
  const recentDocuments = getDocumentsEditedByCurrentUser();

  return (
    <>
      <button
        type="button"
        className={clsx(styles.overlay, open && styles.overlayOpen)}
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />
      <nav
        className={clsx(styles.drawer, open && styles.drawerOpen)}
        aria-label="メニュー"
        aria-hidden={!open}
      >
        <div className={styles.drawerHeader}>
          <Emblem name="fth-oasis-icon" height={28} label="FTH OASIS" />
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <Icon icon={IconX} aria-hidden="true" />
          </button>
        </div>

        <MenuLink to="/" icon={IconHome} label="ホーム" onClick={onClose} />
        <MenuLink
          to="/issues"
          icon={IconFileAlert}
          label="指摘事項一覧"
          onClick={onClose}
        />
        <MenuLink
          to="/pulls"
          icon={IconFileTextSpark}
          label="修正提案一覧"
          onClick={onClose}
        />
        <MenuLink
          to="/documents"
          icon={IconFileText}
          label="文書一覧"
          onClick={onClose}
        />
        <MenuLink
          to="/books"
          icon={IconReceiptYen}
          label="会計処理一覧"
          onClick={onClose}
        />
        <MenuLink
          to="/meetings"
          icon={IconCalendarTime}
          label="会議一覧"
          onClick={onClose}
        />

        <Divider />

        <MenuLink
          to="/print-queue"
          icon={IconPrinter}
          label="印刷状況"
          onClick={onClose}
        />
        <MenuLink
          to="/room-reservations"
          icon={IconBuildingEstate}
          label="新館予約状況"
          onClick={onClose}
        />
        <MenuLink
          to="/equipment-loans"
          icon={IconPackage}
          label="備品貸出状況"
          onClick={onClose}
        />

        <Divider />

        <MenuLink
          to="/materials"
          icon={IconBook2}
          label="規則･資料"
          onClick={onClose}
        />
        <MenuLink
          to="/orgs"
          icon={IconBuilding}
          label="組織一覧"
          onClick={onClose}
        />

        <Divider />

        {/* 「直近で編集した文書を画面に収まる限り入れてほしい」という依頼のため,
            .drawer 自体のスクロールとは別に, この一覧だけ overflow: hidden で
            クリップし, スクロールではなく単純に入りきる分だけ表示する
            (.spacer と同じ flex: 1 1 auto で残りの縦幅を埋めつつ, 「問題を
            報告」ボタンを最下部に押し出す役割も兼ねる) */}
        <div className={styles.recentDocuments}>
          {recentDocuments.map((document) => (
            <Link
              key={document.id}
              to={`/orgs/${document.organizationId}/documents/${document.id}`}
              onClick={onClose}
              className={menuItemBase.root}
            >
              <Avater shape="square" size={20} />
              <span
                className={styles.recentDocumentLabel}
                title={`${MOCK_ORGANIZATION.name}/${document.title}`}
              >
                {MOCK_ORGANIZATION.name}/{document.title}
              </span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          className={clsx(menuItemBase.root, styles.reportButton)}
        >
          <Icon icon={IconMessageReport} aria-hidden="true" />
          <span>問題を報告</span>
        </button>
      </nav>
    </>
  );
}

export { NavDrawer };

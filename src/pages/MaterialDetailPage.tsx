import { MaterialBreadcrumb } from "@src/features/materials/components/MaterialBreadcrumb";
import { MaterialsExplorer } from "@src/features/materials/components/MaterialsExplorer";
import { MOCK_MATERIAL_DOCUMENTS } from "@src/features/materials/mockData";
import { useParams } from "react-router";

import styles from "./MaterialDetailPage.module.css";

// 規則・資料の文書詳細ページ (/materials/:documentKey). 「セクション内の
// リンクを押下すると, 上部にパンくずを表示し, 下部に文書閲覧及び選択画面が
// 出るようにしてほしい」という依頼のため, MaterialBreadcrumb + MaterialsExplorer
// をこの順に描画するだけの薄いページ (OrganizationDocumentLayout などと同じ
// 「存在チェック+本文の組み合わせ」だが, ネストしたルートを持たないため
// 単一のページコンポーネントで完結させている)
function MaterialDetailPage() {
  const { documentKey } = useParams();
  const document = MOCK_MATERIAL_DOCUMENTS.find((candidate) => candidate.key === documentKey);

  if (!document) {
    return <p className={styles.notFound}>文書が見つかりません.</p>;
  }

  return (
    <div className={styles.root}>
      <MaterialBreadcrumb document={document} />
      <MaterialsExplorer selectedDocumentKey={document.key} />
    </div>
  );
}

export { MaterialDetailPage };

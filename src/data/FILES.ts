export type DataFile = {
  // Internal unique identifier. MUST be unique AND case-sensitive.
  id: string;
  // File name pattern as a Regex string. MUST be end-exact AND include the extension.
  pattern: string;
  // Git commit message [SCOPE] part.
  scopeLabel: string;
  // Git commit message [ACTION] part related to the Git state when this file is tracked.
  actionLabel?: {
    // Prefiller Default: `"create"`.
    onCreate?: string;
    // Prefiller Default: `"delete"`.
    onDelete?: string;
    // Prefiller Default: `"update"`.
    onModify?: string;
    // Prefiller Default: `"move"`.
    onRename?: string;
  };
  // To which other files may it be linked ? Prefiller Default: `[]`.
  links?: {
    // File internal unique identifier.
    id: string;
    // When this file is linked to this other file, does the Prefiller should prefill commit
    // messages prioritizing this file specifications over the other one ?
    isDefault: boolean;
  }[];
  // Does this file is usually ignored ? Prefiller Default: `false`.
  shouldBeIgnored?: boolean;
};

const FILES: DataFile[] = [
  {
    id: 'CHANGELOG',
    pattern: '/CHANGE[-_]?LOG(\\.(md|txt))?$/i',
    scopeLabel: 'changelog',
  },
  {
    id: 'DOT_Dockerfile',
    pattern: '/[^\\/\\\\]*\\.Dockerfile$/i',
    scopeLabel: 'docker',
  },
  {
    id: 'DOT_travis_DOT_yml',
    pattern: '/\\.travis\\.yml$/i',
    scopeLabel: 'travis',
  },
  {
    id: 'jest_DOT_config_DOT_js',
    pattern: '/jest\\.config\\.js$/i',
    scopeLabel: 'jest',
  },
  {
    id: 'package_DASH_lock_DOT_json',
    pattern: '/package-lock\\.json$/i',
    scopeLabel: 'npm',
    links: [
      {
        id: 'package_DOT_json',
        isDefault: false,
      },
    ],
  },
  {
    id: 'package_DOT_json',
    pattern: '/package\\.json$/i',
    scopeLabel: 'npm',
    links: [
      {
        id: 'package_DASH_lock_DOT_json',
        isDefault: true,
      },
      {
        id: 'yarn_DOT_lock',
        isDefault: false,
      },
    ],
  },
  {
    id: 'yarn_DOT_lock',
    pattern: '/yarn\\.lock$/i',
    scopeLabel: 'yarn',
    links: [
      {
        id: 'package_DOT_json',
        isDefault: true,
      },
    ],
  },
];

export default FILES;

export type DataFile = {
  // Internal unique identifier. MUST be unique AND case-sensitive.
  id: string;
  // File name pattern as a Regex string. MUST be end-exact AND include the extension.
  pattern: RegExp;
  // Git commit message [SCOPE] part.
  scopeLabel: string;
  // Git commit message [ACTION] part related to the Git state when this file is tracked.
  actionLabel?: {
    // Committer Default: `"create"`.
    onCreate?: string;
    // Committer Default: `"delete"`.
    onDelete?: string;
    // Committer Default: `""`.
    onModify?: string;
    // Committer Default: `"move"`.
    onRename?: string;
  };
  // To which other files may it be linked ? Committer Default: `[]`.
  links?: {
    // File internal unique identifier.
    id: string;
    // When this file is linked to this other file, does the Committer should prefill commit
    // messages prioritizing this file specifications over the other one ?
    isDefault: boolean;
  }[];
  // Does this file is usually ignored ? Committer Default: `false`.
  shouldBeIgnored?: boolean;
};

const FILES: DataFile[] = [
  {
    id: 'CHANGELOG',
    pattern: /^CHANGE[-_]?LOG(\.(md|txt))?$/i,
    scopeLabel: 'changelog',
    actionLabel: {
      onModify: 'update ',
    },
  },
  {
    id: 'DOT_Dockerfile',
    pattern: /^[a-z0-9-_]*\.Dockerfile$/i,
    scopeLabel: 'docker',
  },
  {
    id: 'DOT_gitignore',
    pattern: /\.gitignore$/i,
    scopeLabel: 'git',
    actionLabel: {
      onCreate: 'ignore ',
      onModify: 'ignore ',
    },
  },
  {
    id: 'DOT_travis_DOT_yml',
    pattern: /^\.travis\.yml$/i,
    scopeLabel: 'travis',
  },
  {
    id: 'jest_DOT_config_DOT_js',
    pattern: /^jest\.config\.js$/i,
    scopeLabel: 'jest',
  },
  {
    id: 'package_DASH_lock_DOT_json',
    pattern: /^package-lock\.json$/i,
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
    pattern: /^package\.json$/i,
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
    id: 'README_DOT_md',
    pattern: /^README(\.(md|txt))?$/i,
    scopeLabel: 'readme',
    actionLabel: {
      onModify: 'update ',
    },
  },
  {
    id: 'yarn_DOT_lock',
    pattern: /^yarn\.lock$/i,
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

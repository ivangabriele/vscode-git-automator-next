/// <reference types="@types/jest" />

import * as R from 'ramda';

import FILES, { DataFile } from '../../../src/data/FILES';

type DataFileLinksEntry = DataFile['links'][0];

describe('data/files()', () => {
  let ids: string[];

  beforeAll(() => {
    ids = FILES.map(({ id }: DataFile) => id);
  });

  test('should have unique ids', () => {
    expect(R.uniq(ids)).toEqual(ids);
  });

  test('should be sorted by id alphabetically', () => {
    const sortAlphabetically = R.sortBy(R.toLower);

    expect(sortAlphabetically(ids)).toEqual(ids);
  });

  describe('Each file entry:', () => {
    test('should have unique ids within each of its links', () => {
      const checkLinks = (file: DataFile) => {
        if (file.links === undefined) return;
        const fileLinksIds = file.links.map(link => link.id);

        if (!R.equals(R.uniq(fileLinksIds), fileLinksIds)) {
          throw `A "${file.id}" links has duplicated ids: "${fileLinksIds.join('", "')}".`;
        }
      };

      expect(() => FILES.forEach(checkLinks)).not.toThrow();
    });

    test('should have resolvable ids within its links', () => {
      const checkLinkId = (fileId: string, fileLink: DataFileLinksEntry) => {
        if (!ids.includes(fileLink.id)) {
          throw `A "${fileId}" link has an unresovable id: "${fileLink.id}".`;
        }
      };

      const checkLinks = (file: DataFile) => {
        if (file.links === undefined) return;

        file.links.forEach(link => checkLinkId(file.id, link));
      };

      expect(() => FILES.forEach(checkLinks)).not.toThrow();
    });

    test('should have back links for all of its links', () => {
      const checkBackLink = (sourceFileId: string, sourceFilelink: DataFileLinksEntry) => {
        const targetFile = FILES.filter(file => file.id === sourceFilelink.id)[0];

        if (R.type(targetFile.links) !== 'Array' || targetFile.links.length === 0) {
          throw `A "${sourceFileId}" link to "${targetFile.id}" doesn't have a back link.`;
        }

        const targetFileMatches = targetFile.links.filter(link => link.id === sourceFileId);

        if (targetFileMatches.length === 0) {
          throw `A "${sourceFileId}" link to "${targetFile.id}" doesn't have a back link.`;
        }
      };

      const checkLinks = (sourceFile: DataFile) => {
        if (sourceFile.links === undefined) return;

        sourceFile.links.forEach(link => checkBackLink(sourceFile.id, link));
      };

      expect(() => FILES.forEach(checkLinks)).not.toThrow();
    });

    test('should not have any conflicting back link default for any of its links', () => {
      const checkBackLinkDefault = (sourceFileId: string, sourceFilelink: DataFileLinksEntry) => {
        const targetFile = FILES.filter(file => file.id === sourceFilelink.id)[0];
        const targetFileLink = targetFile.links.filter(link => link.id === sourceFileId)[0];

        if (targetFileLink.isDefault === sourceFilelink.isDefault) {
          throw `A "${sourceFileId}" link to "${targetFile.id}" has a conflicted default.`;
        }
      };

      const checkLinks = (sourceFile: DataFile) => {
        if (sourceFile.links === undefined) return;

        sourceFile.links.forEach(link => checkBackLinkDefault(sourceFile.id, link));
      };

      expect(() => FILES.forEach(checkLinks)).not.toThrow();
    });
  });
});

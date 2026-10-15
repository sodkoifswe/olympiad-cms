#!/usr/bin/env python3

import unittest
from types import SimpleNamespace

from cms.server.admin.handlers.dataset import AddTestcaseHandler


class AddTestcaseContentsTest(unittest.TestCase):

    def make_handler(self, arguments=None, files=None):
        arguments = arguments or {}

        def get_body_argument(name, default=None, strip=True):
            self.assertFalse(strip)
            return arguments.get(name, default)

        return SimpleNamespace(
            get_body_argument=get_body_argument,
            request=SimpleNamespace(files=files or {}))

    def test_text_preserves_whitespace_and_encodes_utf8(self):
        handler = self.make_handler({
            "input_text": "  5\r\n\r\nөгөгдөл \r\n",
            "output_text": " 15 \r\n",
        })

        self.assertEqual(
            AddTestcaseHandler._get_testcase_contents(handler, "text"),
            ("  5\n\nөгөгдөл \n".encode("utf-8"), b" 15 \n"))

    def test_empty_text_is_a_valid_testcase(self):
        handler = self.make_handler({"input_text": "", "output_text": ""})

        self.assertEqual(
            AddTestcaseHandler._get_testcase_contents(handler, "text"),
            (b"", b""))

    def test_text_does_not_gain_a_final_newline(self):
        handler = self.make_handler({
            "input_text": "1 2", "output_text": "3"})

        self.assertEqual(
            AddTestcaseHandler._get_testcase_contents(handler, "text"),
            (b"1 2", b"3"))

    def test_existing_file_upload_keeps_bytes_unchanged(self):
        handler = self.make_handler(files={
            "input": [{"body": b"\x00\r\n"}],
            "output": [{"body": b"\xff\n"}],
        })

        self.assertEqual(
            AddTestcaseHandler._get_testcase_contents(handler, "upload"),
            (b"\x00\r\n", b"\xff\n"))

    def test_missing_fields_and_unknown_source_are_rejected(self):
        for source in ("text", "upload", "other"):
            with self.subTest(source=source):
                with self.assertRaises(ValueError):
                    AddTestcaseHandler._get_testcase_contents(
                        self.make_handler(), source)


if __name__ == "__main__":
    unittest.main()

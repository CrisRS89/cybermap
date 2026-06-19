import pytest

from app.services.nmap_parser import (
    MAX_NMAP_XML_BYTES,
    NmapParseError,
    parse_nmap_xml,
)


def test_parse_nmap_xml_extracts_host_address_hostname_and_open_ports():
    xml = """<?xml version="1.0"?>
    <nmaprun>
      <host>
        <status state="up"/>
        <address addr="192.168.1.10" addrtype="ipv4"/>
        <hostnames>
          <hostname name="server.local" type="user"/>
        </hostnames>
        <ports>
          <port protocol="tcp" portid="22">
            <state state="open"/>
            <service name="ssh"/>
          </port>
          <port protocol="tcp" portid="80">
            <state state="closed"/>
            <service name="http"/>
          </port>
          <port protocol="tcp" portid="443">
            <state state="open"/>
            <service name="https"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    result = parse_nmap_xml(xml)

    assert result.hosts_seen == 1
    assert result.open_ports_seen == 2
    assert result.warnings == []

    host = result.hosts[0]
    assert host.address == "192.168.1.10"
    assert host.hostnames == ["server.local"]
    assert [(port.port, port.protocol, port.service) for port in host.open_ports] == [
        (22, "tcp", "ssh"),
        (443, "tcp", "https"),
    ]


def test_parse_nmap_xml_accepts_host_without_ports():
    xml = """<nmaprun>
      <host>
        <address addr="10.0.0.5" addrtype="ipv4"/>
      </host>
    </nmaprun>
    """

    result = parse_nmap_xml(xml)

    assert result.hosts_seen == 1
    assert result.open_ports_seen == 0


def test_parse_nmap_xml_skips_host_without_address():
    xml = """<nmaprun>
      <host>
        <status state="up"/>
      </host>
    </nmaprun>
    """

    result = parse_nmap_xml(xml)

    assert result.hosts == []
    assert result.warnings == ["Skipped host without address"]


def test_parse_nmap_xml_rejects_empty_payload():
    with pytest.raises(NmapParseError, match="empty"):
        parse_nmap_xml("")


def test_parse_nmap_xml_rejects_malformed_xml():
    with pytest.raises(NmapParseError, match="Malformed"):
        parse_nmap_xml("<nmaprun><host></nmaprun>")


def test_parse_nmap_xml_rejects_non_nmap_root():
    with pytest.raises(NmapParseError, match="nmaprun"):
        parse_nmap_xml("<root></root>")


def test_parse_nmap_xml_rejects_dtd():
    xml = """<!DOCTYPE nmaprun [
      <!ELEMENT nmaprun ANY>
    ]>
    <nmaprun></nmaprun>
    """

    with pytest.raises(NmapParseError, match="DTD"):
        parse_nmap_xml(xml)


def test_parse_nmap_xml_rejects_entities():
    xml = """<!ENTITY xxe SYSTEM "file:///etc/passwd">
    <nmaprun></nmaprun>
    """

    with pytest.raises(NmapParseError, match="entities"):
        parse_nmap_xml(xml)


def test_parse_nmap_xml_rejects_payload_over_limit():
    oversized = "<nmaprun>" + (" " * MAX_NMAP_XML_BYTES) + "</nmaprun>"

    with pytest.raises(NmapParseError, match="maximum size"):
        parse_nmap_xml(oversized)


def test_parse_nmap_xml_ignores_closed_ports():
    xml = """<nmaprun>
      <host>
        <address addr="10.0.0.8" addrtype="ipv4"/>
        <ports>
          <port protocol="tcp" portid="25">
            <state state="closed"/>
            <service name="smtp"/>
          </port>
        </ports>
      </host>
    </nmaprun>
    """

    result = parse_nmap_xml(xml)

    assert result.open_ports_seen == 0

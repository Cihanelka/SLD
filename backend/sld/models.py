from django.db import models

class Schema(models.Model):
    station_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200, default="Untitled")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Node(models.Model):
    schema = models.ForeignKey(Schema, related_name='nodes', on_delete=models.CASCADE)
    node_id = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=200)
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()

    # Opsiyonel: node tipi ekleyebilirsin (inverter, adp vs)
    node_type = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.label} ({self.node_id})"

class Edge(models.Model):
    schema = models.ForeignKey(Schema, related_name='edges', on_delete=models.CASCADE)
    edge_id = models.CharField(max_length=100, unique=True)
    source = models.ForeignKey(Node, related_name='edges_source', on_delete=models.CASCADE)
    target = models.ForeignKey(Node, related_name='edges_target', on_delete=models.CASCADE)
    label = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.source} -> {self.target}"

class InverterData(models.Model):
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='inverter_data')
    anlik_uretim = models.FloatField(help_text="Anlık üretim gücü (kW)")
    toplam_enerji = models.FloatField(help_text="Toplam enerji (kWh)")
    dc_giris_voltaj = models.FloatField(help_text="DC giriş voltajı (V)")
    dc_giris_akim = models.FloatField(help_text="DC giriş akımı (A)")
    ac_cikis_voltaj = models.FloatField(help_text="AC çıkış voltajı (V)")
    ac_cikis_akim = models.FloatField(help_text="AC çıkış akımı (A)")
    frekans = models.FloatField(help_text="Frekans (Hz)")
    sicaklik = models.FloatField(help_text="Sıcaklık (°C)")
    calisma_durumu = models.CharField(max_length=20, help_text="Çalışma durumu")
    verimlilik = models.FloatField(help_text="Verimlilik (%)")
    mppt_sayisi = models.IntegerField(help_text="MPPT sayısı")
    mppt_verileri = models.TextField(help_text="MPPT verileri (virgülle ayrılmış)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"InverterData {self.id} - Üretim: {self.anlik_uretim} kW"

class AdpData(models.Model):
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='adp_data')
    toml_id = models.IntegerField()
    gerilim = models.FloatField()
    akim = models.FloatField()
    faz_bilgisi_l1 = models.FloatField()
    faz_bilgisi_l2 = models.FloatField()
    faz_bilgisi_l3 = models.FloatField()
    guc_aktif = models.FloatField()
    guc_reaktif = models.FloatField()
    guc_karisik = models.FloatField()
    frekans = models.FloatField()
    enerji_sayaci = models.FloatField()
    topraklama_durumu = models.BooleanField()
    koruma_role_durumu = models.CharField(max_length=10)

    def __str__(self):
        return f"AdpData id {self.id} toml_id {self.toml_id}"

import random
from sld.models import Node, InverterData, AdpData, Schema

def create_random_node():
    # Önce bir schema objesi al veya yarat
    schema = Schema.objects.first()
    if not schema:
        schema = Schema.objects.create(name="Default Schema", station_id="station_1")

    while True:
        node_id = str(random.randint(1, 1000000))
        if not Node.objects.filter(node_id=node_id).exists():
            break
    return Node.objects.create(
        node_id=node_id,
        label=f"Node_{random.randint(1, 1000)}",
        x=random.uniform(0, 1000),
        y=random.uniform(0, 1000),
        width=random.uniform(50, 200),
        height=random.uniform(50, 200),
        schema=schema,  # Schema foreign key'i zorunlu
        node_type=random.choice(['inverter', 'adp', 'other'])  # Node tipi ekle
    )

def create_random_inverter_data(node):
    return InverterData.objects.create(
        node=node,  # Node foreign key'i zorunlu
        anlik_uretim=random.uniform(0, 100),
        toplam_enerji=random.uniform(0, 1000),
        dc_giris_voltaj=random.uniform(100, 500),
        dc_giris_akim=random.uniform(0, 50),
        ac_cikis_voltaj=random.uniform(100, 250),
        ac_cikis_akim=random.uniform(0, 50),
        frekans=random.uniform(45, 65),
        sicaklik=random.uniform(20, 80),
        calisma_durumu=random.choice(['Çalışıyor', 'Durdu']),
        verimlilik=random.uniform(80, 100),
        mppt_sayisi=random.randint(1, 5),
        mppt_verileri=",".join([str(random.uniform(0, 100)) for _ in range(random.randint(1, 5))])
    )

def create_random_adp_data(node):
    return AdpData.objects.create(
        node=node,  # Node foreign key'i zorunlu
        toml_id=random.randint(1, 10),
        gerilim=random.uniform(200, 250),
        akim=random.uniform(0, 50),
        faz_bilgisi_l1=random.uniform(0, 360),
        faz_bilgisi_l2=random.uniform(0, 360),
        faz_bilgisi_l3=random.uniform(0, 360),
        guc_aktif=random.uniform(0, 100),
        guc_reaktif=random.uniform(0, 100),
        guc_karisik=random.uniform(0, 150),
        frekans=random.uniform(45, 65),
        enerji_sayaci=random.uniform(0, 10000),
        topraklama_durumu=random.choice([True, False]),
        koruma_role_durumu=random.choice(['Aktif', 'Pasif'])
    )

def populate(n=10):
    # Her tipten n tane oluştur
    for i in range(n):
        # Inverter node oluştur
        inverter_node = Node.objects.create(
            node_id=f"inverter_{i+1}",
            label=f"Inverter_{i+1}",
            x=random.uniform(0, 1000),
            y=random.uniform(0, 1000),
            width=random.uniform(50, 200),
            height=random.uniform(50, 200),
            schema=Schema.objects.first(),
            node_type='inverter'
        )
        create_random_inverter_data(inverter_node)
        
        # ADP node oluştur
        adp_node = Node.objects.create(
            node_id=f"adp_{i+1}",
            label=f"ADP_{i+1}",
            x=random.uniform(0, 1000),
            y=random.uniform(0, 1000),
            width=random.uniform(50, 200),
            height=random.uniform(50, 200),
            schema=Schema.objects.first(),
            node_type='adp'
        )
        create_random_adp_data(adp_node)
        
        # Other node oluştur
        other_node = Node.objects.create(
            node_id=f"other_{i+1}",
            label=f"Other_{i+1}",
            x=random.uniform(0, 1000),
            y=random.uniform(0, 1000),
            width=random.uniform(50, 200),
            height=random.uniform(50, 200),
            schema=Schema.objects.first(),
            node_type='other'
        )
        # Other node'lar için data oluşturma
    
    print(f"{n*3} tane node oluşturuldu: {n} inverter, {n} adp, {n} other")


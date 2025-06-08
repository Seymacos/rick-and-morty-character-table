import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, User, Heart, Zap, MapPin, Calendar, Eye } from 'lucide-react';

const RickAndMortyTable = () => {
  // State yönetimi
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  // Filtreleme state'leri
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    species: '',
    gender: '',
    origin: ''
  });
  
  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // API'den tüm karakterleri çek (en az 250 karakter için tüm sayfaları)
  useEffect(() => {
    const fetchAllCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let allCharacters = [];
        let nextUrl = 'https://rickandmortyapi.com/api/character';
        
        // Tüm sayfaları çek
        while (nextUrl && allCharacters.length < 250) {
          const response = await fetch(nextUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          allCharacters = [...allCharacters, ...data.results];
          nextUrl = data.info.next;
        }
        
        // En az 250 karakter olduğundan emin ol
        const finalCharacters = allCharacters.slice(0, Math.max(250, allCharacters.length));
        
        setCharacters(finalCharacters);
        setFilteredCharacters(finalCharacters);
      } catch (err) {
        setError(`Veriler yüklenirken hata oluştu: ${err.message}`);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCharacters();
  }, []);

  // Filtreleme ve sıralama logic'i
  const processedCharacters = useMemo(() => {
    let result = [...filteredCharacters];

    // Filtreleme
    result = result.filter(character => {
      return (
        character.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        (filters.status === '' || character.status === filters.status) &&
        (filters.species === '' || character.species.toLowerCase().includes(filters.species.toLowerCase())) &&
        (filters.gender === '' || character.gender === filters.gender) &&
        (filters.origin === '' || character.origin.name.toLowerCase().includes(filters.origin.toLowerCase()))
      );
    });

    // Sıralama
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Origin için özel durum
      if (sortBy === 'origin') {
        aValue = a.origin.name;
        bValue = b.origin.name;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return result;
  }, [filteredCharacters, filters, sortBy, sortOrder]);

  // Sayfalama logic'i
  const paginatedCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCharacters.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCharacters, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedCharacters.length / itemsPerPage);

  // Filter handler
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Filtreleme sonrası ilk sayfaya dön
  };

  // Sort handler
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Status renk helper'ı
  const getStatusColor = (status) => {
    switch (status) {
      case 'Alive': return 'text-green-600 bg-green-100';
      case 'Dead': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Gender icon helper'ı
  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'Male': return '♂️';
      case 'Female': return '♀️';
      default: return '❓';
    }
  };

  // Unique değerler için helper'lar
  const uniqueStatuses = [...new Set(characters.map(c => c.status))];
  const uniqueSpecies = [...new Set(characters.map(c => c.species))];
  const uniqueGenders = [...new Set(characters.map(c => c.gender))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400"></div>
          <p className="text-white text-xl mt-4">Rick and Morty karakterleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hata Oluştu!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🛸 Rick and Morty Karakter Tablosu
          </h1>
          <p className="text-blue-200 text-lg">
            Toplam {characters.length} karakter • {processedCharacters.length} sonuç görüntüleniyor
          </p>
        </div>

        {/* Filtreler */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* İsim Filtresi */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                İsim Ara
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Karakter adı yazın..."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Durum Filtresi */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Heart className="inline w-4 h-4 mr-1" />
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Tümü</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status} className="text-gray-800">{status}</option>
                ))}
              </select>
            </div>

            {/* Tür Filtresi */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Zap className="inline w-4 h-4 mr-1" />
                Tür
              </label>
              <input
                type="text"
                value={filters.species}
                onChange={(e) => handleFilterChange('species', e.target.value)}
                placeholder="Tür ara..."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Cinsiyet Filtresi */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Cinsiyet
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Tümü</option>
                {uniqueGenders.map(gender => (
                  <option key={gender} value={gender} className="text-gray-800">{gender}</option>
                ))}
              </select>
            </div>

            {/* Köken Filtresi */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Köken
              </label>
              <input
                type="text"
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
                placeholder="Köken ara..."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Sayfa Boyutu Seçimi */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-white text-sm font-medium">Sayfa Boyutu:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value={10} className="text-gray-800">10</option>
              <option value={20} className="text-gray-800">20</option>
              <option value={50} className="text-gray-800">50</option>
              <option value={100} className="text-gray-800">100</option>
            </select>
          </div>
        </div>

        {/* Sonuç Mesajı */}
        {processedCharacters.length === 0 ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 text-2xl mr-3">🔍</div>
              <div>
                <h3 className="text-yellow-800 font-medium">Sonuç Bulunamadı</h3>
                <p className="text-yellow-700">Arama kriterlerinize uygun karakter bulunamadı. Lütfen filtrelerinizi kontrol edin.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tablo */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Resim</th>
                      <th 
                        className="px-6 py-4 text-left cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          İsim
                          {sortBy === 'name' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Durum
                          {sortBy === 'status' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('species')}
                      >
                        <div className="flex items-center gap-2">
                          Tür
                          {sortBy === 'species' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('gender')}
                      >
                        <div className="flex items-center gap-2">
                          Cinsiyet
                          {sortBy === 'gender' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('origin')}
                      >
                        <div className="flex items-center gap-2">
                          Köken
                          {sortBy === 'origin' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCharacters.map((character, index) => (
                      <tr 
                        key={character.id} 
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedCharacter(character)}
                      >
                        <td className="px-6 py-4">
                          <img 
                            src={character.image} 
                            alt={character.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{character.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(character.status)}`}>
                            {character.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{character.species}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1">
                            {getGenderIcon(character.gender)}
                            {character.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{character.origin.name}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCharacter(character);
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Detay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {processedCharacters.length} sonuçtan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, processedCharacters.length)} arası gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Önceki
                  </button>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Karakter Detay Modal */}
        {selectedCharacter && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative">
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                >
                  ✕
                </button>
                <img 
                  src={selectedCharacter.image} 
                  alt={selectedCharacter.name}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedCharacter.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCharacter.status)}`}>
                    {selectedCharacter.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Temel Bilgiler
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> #{selectedCharacter.id}</div>
                      <div><strong>Tür:</strong> {selectedCharacter.species}</div>
                      <div><strong>Alt Tür:</strong> {selectedCharacter.type || 'Belirtilmemiş'}</div>
                      <div><strong>Cinsiyet:</strong> {getGenderIcon(selectedCharacter.gender)} {selectedCharacter.gender}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Lokasyon Bilgileri
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Köken:</strong> {selectedCharacter.origin.name}</div>
                      <div><strong>Son Konum:</strong> {selectedCharacter.location.name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Bölümler
                  </h3>
                  <div className="text-sm text-gray-600">
                    {selectedCharacter.episode.length} bölümde görüldü
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCharacter.episode.slice(0, 10).map((episodeUrl, index) => {
                      const episodeNumber = episodeUrl.split('/').pop();
                      return (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          E{episodeNumber}
                        </span>
                      );
                    })}
                    {selectedCharacter.episode.length > 10 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{selectedCharacter.episode.length - 10} daha
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RickAndMortyTable;
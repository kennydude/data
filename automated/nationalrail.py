'''
Pull National Rail info
'''

import urllib2, json, urllib
from bs4 import *

def get_json(page, headers = []):
	opener = urllib2.build_opener()
	headers.extend([
		('User-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11')
	])
	opener.addheaders = headers
	return json.load(opener.open(page))

def fetch_page(page, parser=None):
	opener = urllib2.build_opener()
	opener.addheaders = [('User-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11')]
	args = []
	if parser != None:
		args.append(parser)
	return BeautifulSoup(opener.open(page).read(), *args)

print "National Rail"
url = "http://www.nationalrail.co.uk/stations/codes/"
soup = fetch_page(url)

ul = soup.find("ul", **{ "class" : "destinations" })
out = open("nationalrail.json", 'w')
data = []

for station in ul.find_all("td", **{ "class" : "h" }):
	url = "http://www.nationalrail.co.uk%s" % station.find("a")['href']
	mSoup = fetch_page(url)
	addr = ''
	for ad in mSoup.find("address").strings:
		addr = addr + ad.strip() + "\n"
	addr = addr.strip()

	url = "http://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false" % addr.split("\n")[-1].replace(" ", "%20")
	goog = get_json(url)
	
	lat = None
	lng = None
	try:
		lat = goog['results'][0]['geometry']['location']['lat']
		lng = goog['results'][0]['geometry']['location']['lng']
	except BaseException:
		pass

	data.append([
		station.string,
		station.parent.find("td", **{ "class" : "s" } ).string,
		addr,
		lat,
		lng
	])

	print station.string

json.dump(data, out)
out.close()
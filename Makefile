.PHONY: all test clean

istanbul = ./node_modules/.bin/istanbul
mocha =  ./node_modules/.bin/mocha
_mocha= ./node_modules/.bin/_mocha
push:
	git push origin master
test:
	@ if [ -n "$(g)" ]; \
	then \
		echo 'mocha --recursive --timeout 10000 --harmony --bail -g $(g) test'; \
		$(mocha) --recursive --timeout 10000 --harmony --bail -g $(g) test; \
	else \
		echo 'mocha --recursive --timeout 10000 --harmony --bail test'; \
		$(mocha) --recursive --timeout 10000 --harmony --bail test; \
	fi
test-cov:
	rm -rf coverage
	$(istanbul) cover $(_mocha) -- --recursive --timeout 10000 --harmony --bail test
check-cov: 
	istanbul check-coverage --statements 100 --branches 100 --functions 100 --lines 100